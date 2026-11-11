export type AdminRole = "super_admin" | "admin" | "editor";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  category?: PortfolioCategory | null;
  brand_or_industry: string;
  project_type: "Demo Concept" | "Client Production";
  short_description: string;
  full_description: string;
  creative_concept: string;
  production_highlights: string[];
  duration_label: string;
  thumbnail_url: string;
  video_url: string;
  mobile_video_url: string;
  before_image_url: string;
  after_image_url: string;
  before_after_caption: string;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BeforeAfterComparison {
  id: string;
  title: string;
  category_label: string;
  description: string;
  before_image_url: string;
  after_image_url: string;
  display_order: number;
  is_published: boolean;
}

export interface ServiceItem {
  id: string;
  number_label: string;
  title: string;
  slug: string;
  short_description: string;
  business_value: string;
  creative_approach: string;
  deliverables: string[];
  ideal_for: string[];
  hero_image_url: string;
  video_url: string;
  cta_label: string;
  display_order: number;
  is_published: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  price_label: string;
  deliverables_summary: string;
  video_duration_summary: string;
  revisions_summary: string;
  delivery_timeline: string;
  included_services: string[];
  additional_benefits: string[];
  cta_label: string;
  is_highlighted: boolean;
  is_published: boolean;
  display_order: number;
}

export type InquiryStatus =
  | "New"
  | "Contacted"
  | "Proposal Sent"
  | "In Discussion"
  | "Approved"
  | "In Production"
  | "Completed"
  | "Rejected";

export interface ClientInquiry {
  id: string;
  inquiry_code: string;
  full_name: string;
  brand_name: string;
  email: string;
  whatsapp: string;
  website_url: string;
  industry: string;
  required_service: string;
  budget_range: string;
  expected_deliverables: string;
  preferred_timeline: string;
  project_description: string;
  reference_links: string[];
  consent_accepted: boolean;
  status: InquiryStatus;
  internal_notes: string;
  source_type: "project_brief" | "contact_message";
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  alt_text: string;
  asset_kind: "image" | "video" | "document";
  usage_slot:
    | "hero"
    | "showreel"
    | "portfolio"
    | "service"
    | "industry"
    | "before_after"
    | "general"
    | "inquiry_upload";
  bucket_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size_bytes: number;
  inquiry_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface TestimonialItem {
  id: string;
  client_name: string;
  role_and_company: string;
  quote: string;
  project_type: string;
  is_approved: boolean;
  is_published: boolean;
  display_order: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
}

export interface SiteContentBlock {
  key: string;
  section: string;
  label: string;
  content: Record<string, unknown>;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  brand_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  announcement_enabled: boolean;
  announcement_text: string;
  hero_video_url: string;
  hero_mobile_video_url: string;
  hero_poster_url: string;
  showreel_video_url: string;
  showreel_poster_url: string;
  contact_email: string;
  whatsapp_number: string;
  social_links: Record<string, string>;
  theme_accent: Record<string, string>;
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  footer_tagline: string;
  footer_copyright: string;
}

export interface ActivityLog {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  actor_email: string;
  created_at: string;
}
