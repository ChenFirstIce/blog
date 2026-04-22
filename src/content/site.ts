import { BookOpen, Github, Heart, Tv, User } from 'lucide-react';
import type { ContactLink, Education, Honor, Project, SkillGroup } from '../types';

export const siteProfile = {
  name: 'Chen1Ice',
  role: 'CS Student & Anime Lover',
  avatar: '/logo.svg',
  github: 'https://github.com/ChenFirstIce',
  intro:
    '计算机学生，记录课程学习、项目实践和随笔，也整理自己看过的番剧与朋友们的网站。',
};

export const navigation = [
  { name: 'Home', path: '/', icon: User },
  { name: 'Blog', path: '/blog', icon: BookOpen },
  { name: 'Anime', path: '/anime', icon: Tv },
  { name: 'Friends', path: '/friends', icon: Heart },
];

export const education: Education[] = [
  {
    school: '中国海洋大学',
    major: '软件工程',
    period: '2023 - 2027',
    interests: ['ACG', 'Knowledge Management'],
    summary:
      '初步摸索学习方式和生活方式的未成年成年人',
  },
];

export const honors: Honor[] = [
  {
    title: 'Coursework & Practice',
    description: 'A growing archive of course notes, project experiments, and technical write-ups.',
  },
];

export const projects: Project[] = [
  {
    name: 'personal-blog',
    description: 'Local Markdown based personal site with categories, tags, PDF embeds, and article reading mode.',
    stack: ['React', 'Vite', 'TailwindCSS', 'Markdown'],
    status: 'active',
    href: '/blog',
  },
  {
    name: 'anime-wall',
    description: 'Bilibili following list proxy and responsive anime wall for tracking watched and followed series.',
    stack: ['Express', 'Netlify Functions', 'Bilibili API'],
    status: 'shipping',
    href: '/anime',
  },
  {
    name: 'course-notes',
    description: 'Structured notes workflow for turning Obsidian Markdown into readable posts and reusable study notes.',
    stack: ['Obsidian', 'Markdown', 'ReactMarkdown'],
    status: 'iterating',
    href: '/blog/category/course-notes',
  },
];

export const skillGroups: SkillGroup[] = [
  { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'C/C++'] },
  { label: 'Frontend', items: ['React', 'TailwindCSS', 'Responsive UI', 'Markdown Rendering'] },
  { label: 'Backend', items: ['Node.js', 'Express', 'Netlify Functions', 'REST APIs'] },
  { label: 'Tools', items: ['Git', 'Vite', 'Obsidian', 'VS Code'] },
];

export const contactLinks: ContactLink[] = [
  { label: 'github', value: 'ChenFirstIce', href: siteProfile.github },
  { label: 'blog', value: '/blog', href: '/blog' },
  { label: 'anime', value: '/anime', href: '/anime' },
  { label: 'friends', value: '/friends', href: '/friends' },
];

export const socialLinks = [
  { label: 'GitHub', href: siteProfile.github, icon: Github },
];
