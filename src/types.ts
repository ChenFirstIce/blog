export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'Learning' | 'Essay' | 'Project' | 'Notes' | 'Tutorial';
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

export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
  avatar?: string;
}
