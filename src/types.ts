export interface PostTag {
  label: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  createdAt: any;
  authorId: string;
}

export interface Anime {
  id: string;
  name: string;
  imageUrl: string;
  score: number;
  comment: string;
  createdAt: any;
}

export interface Diary {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: any;
  authorId: string;
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
