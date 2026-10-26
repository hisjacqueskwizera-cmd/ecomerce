import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";
import { createAdvertisingAgreement, createSellerAgreement } from "../../../../../lib/contracts/pdf.mjs";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { data: { claims } = {} } = await supabase.auth.getClaims();
  if (!claims?.sub) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", claims.sub).maybeSingle();
  if (error || profile?.role !== "super_admin") return NextResponse.json({ error: "Super admin access is required." }, { status: 403 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 30000) return NextResponse.json({ error: "The agreement form is too large." }, { status: 413 });
  try {
    const data = await request.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Invalid agreement data." }, { status: 400 });
    const { type } = await params;
    let pdf, filename;
    if (type === "seller") {
      const required = ["openLegalName", "openContact", "sellerLegalName", "sellerRepresentative", "sellerContact", "agreementDates", "agreementTerm"];
      if (required.some(key => !String(data[key] || "").trim()) || !["commission", "subscription"].includes(data.plan)) return NextResponse.json({ error: "Complete all required party fields and select one seller plan." }, { status: 400 });
      if (data.plan === "subscription" && !String(data.subscriptionDetails || "").trim()) return NextResponse.json({ error: "Enter the subscription payment due date and first coverage period." }, { status: 400 });
      if (!["accepted", "declined"].includes(data.liveSelling) || !["accepted", "declined"].includes(data.shopMaterials) || !["accepted", "declined"].includes(data.coupons) || !["accepted", "declined"].includes(data.advertising)) return NextResponse.json({ error: "Select Accepted or Declined for each seller permission." }, { status: 400 });
      pdf = createSellerAgreement(data); filename = "Seller Partnership and Product Listing Agreement.pdf";
    } else if (type === "advertising") {
      const required = ["openLegalName", "openContact", "advertiserName", "advertiserRepresentative", "advertiserContact", "campaignObjective", "campaignDates", "paymentDetails", "creativeDetails"];
      if (required.some(key => !String(data[key] || "").trim())) return NextResponse.json({ error: "Complete all required advertiser and campaign fields." }, { status: 400 });
      const selectedCount = Array.isArray(data.placements) ? data.placements.length : 0;
      if (!(data.bundle === true || selectedCount > 0) || !["monthly", "annual"].includes(data.term)) return NextResponse.json({ error: "Select at least one placement and a valid campaign term." }, { status: 400 });
      const allowedPlacements = ["Homepage top banner", "Homepage left-side banner", "Homepage right-side banner", "Product-grid advertising card", "Product-detail advertising card"];
      if (!Array.isArray(data.placements) || data.placements.some(item => !allowedPlacements.includes(item)) || (data.bundle && selectedCount)) return NextResponse.json({ error: "The selected advertising placements are invalid." }, { status: 400 });
      if (data.term === "monthly" && (!Number.isInteger(Number(data.termMonths)) || Number(data.termMonths) < 3 || Number(data.termMonths) > 12)) return NextResponse.json({ error: "Advertising commitments must be between 3 and 12 months." }, { status: 400 });
      if (data.founding && (data.bundle !== true || data.term !== "monthly" || data.foundingApproved !== true)) return NextResponse.json({ error: "The founding offer needs documented business approval, the full bundle, and a non-annual plan." }, { status: 400 });
      if (data.term === "annual" && data.founding) return NextResponse.json({ error: "The annual discount cannot be combined with the founding offer." }, { status: 400 });
      if (![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(data.videoCount)) || ![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(data.liveCount))) return NextResponse.json({ error: "Social service quantities must be from 0 to 10." }, { status: 400 });
      pdf = createAdvertisingAgreement(data); filename = "Advertising and Marketing Services Agreement.pdf";
    } else return NextResponse.json({ error: "Unknown agreement type." }, { status: 404 });
    return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "The agreement could not be generated. Check the entered details and try again." }, { status: 400 });
  }
}
