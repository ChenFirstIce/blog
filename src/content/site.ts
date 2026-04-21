import { BookOpen, Github, Heart, Tv, User } from 'lucide-react';
import type { Education, Honor } from '../types';

export const siteProfile = {
  name: 'Chen1Ice',
  role: 'CS Student & Anime Lover',
  avatar: '/logo.svg',
  github: 'https://github.com/ChenFirstIce',
  intro:
    '计算机学生，记录课程学习、项目实践、随笔感想，也整理自己看过的动漫和朋友们的网站。',
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
  },
];

export const honors: Honor[] = [
  {
    title: '课程与竞赛经历',
    description: '这里可以替换为你的奖学金、竞赛、项目或荣誉经历。',
  },
];

export const socialLinks = [
  { label: 'GitHub', href: siteProfile.github, icon: Github },
];
