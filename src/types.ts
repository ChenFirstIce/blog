export interface PostTag {
  label: string;
  slug: string;
}

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
  category: string;
  categorySlug: string;
  tags: PostTag[];
  excerpt: string;
  body: string;
  pdf?: string;
  draft: boolean;
}

export interface TaxonomyItem {
  label: string;
  slug: string;
  count: number;
}

export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
  avatar?: string;
}

export interface Honor {
  title: string;
  description: string;
}

export interface Education {
  school: string;
  major: string;
  period: string;
}
