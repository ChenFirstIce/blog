import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, GraduationCap, Mail } from 'lucide-react';
import { contactLinks, education, projects, siteProfile, skillGroups } from '../content/site';

const sectionLabel = (index: string, title: string) => (
  <div className="mb-6 flex items-center gap-3 font-mono">
    <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">
      {index}
    </span>
    <h2 className="text-2xl font-bold text-[var(--color-text)]">{title}</h2>
  </div>
);

const TerminalHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="terminal-panel-title flex items-center justify-between px-4 py-3 font-mono text-xs">
    <span>{title}</span>
    <span className="text-[var(--color-primary)]">online</span>
  </div>
);

const ShellLine: React.FC<{ command: string; children?: React.ReactNode }> = ({ command, children }) => (
  <div className="space-y-2 font-mono text-sm">
    <p className="terminal-prompt text-[var(--color-text)]">{command}</p>
    {children && <div className="pl-4 text-[var(--color-muted)]">{children}</div>}
  </div>
);

const HomeHero = () => (
  <section className="reveal grid gap-8 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
    <div className="terminal-panel overflow-hidden">
      <TerminalHeader title="~/chen1ice/profile.md" />
      <div className="space-y-8 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--color-muted)]">
          <span className="terminal-chip">developer</span>
          <span className="terminal-chip">student</span>
          <span className="terminal-chip">markdown-first</span>
        </div>

        <div className="space-y-4">
          <p className="font-mono text-sm font-bold text-[var(--color-primary)]">const owner =</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            {siteProfile.name}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
            {siteProfile.intro}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="#education"
            className="interactive inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-mono text-sm font-bold text-[var(--color-primary-contrast)]"
          >
            <GraduationCap size={16} />
            education
          </a>
          <Link
            to="/blog"
            className="interactive inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono text-sm font-bold text-[var(--color-text)]"
          >
            <BookOpen size={16} />
            read blog
          </Link>
        </div>
      </div>
    </div>

    <aside className="terminal-panel overflow-hidden">
      <TerminalHeader title="status" />
      <div className="space-y-5 p-5 sm:p-7">
        <img
          src={siteProfile.avatar}
          alt={`${siteProfile.name} logo`}
          className="size-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-solid)] object-cover p-2"
        />
        <ShellLine command="whoami">
          <p>{siteProfile.role}</p>
        </ShellLine>
        <ShellLine command="cat focus.txt">
          <ul className="grid gap-2">
            <li>software engineering coursework</li>
            <li>local-first markdown publishing</li>
            <li>anime archive and personal knowledge base</li>
          </ul>
        </ShellLine>
      </div>
    </aside>
  </section>
);

const EducationTimeline = () => (
  <section id="education" className="reveal scroll-mt-24">
    {sectionLabel('01', 'Education')}
    <div className="terminal-panel overflow-hidden">
      <TerminalHeader title="education.timeline" />
      <div className="space-y-0 p-5 sm:p-7">
        {education.map((item, index) => (
          <article key={`${item.school}-${item.period}`} className="relative grid gap-5 border-l border-[var(--color-border)] pb-10 pl-6 last:pb-0 lg:grid-cols-[12rem_1fr]">
            <div className="absolute -left-[5px] top-1 size-2.5 rounded-full bg-[var(--color-primary)]" />
            <div className="font-mono text-sm text-[var(--color-muted)]">
              <p className="font-bold text-[var(--color-primary)]">[{String(index + 1).padStart(2, '0')}]</p>
              <p>{item.period}</p>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-text)]">{item.school}</h3>
                  <p className="mt-1 font-mono text-sm font-bold text-[var(--color-primary)]">{item.major}</p>
                </div>
                <span className="w-fit rounded-lg bg-[var(--color-accent-soft)] px-3 py-1 font-mono text-xs font-bold text-[var(--color-text)]">
                  core node
                </span>
              </div>

              <p className="mb-5 leading-7 text-[var(--color-muted)]">{item.summary}</p>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-3 font-mono text-xs font-bold uppercase text-[var(--color-muted)]">research interests</p>
                  <div className="flex flex-wrap gap-2">
                    {item.interests.map((interest) => (
                      <span key={interest} className="terminal-chip">{interest}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 font-mono text-xs font-bold uppercase text-[var(--color-muted)]">core courses</p>
                  <div className="flex flex-wrap gap-2">
                    {item.courses.map((course) => (
                      <span key={course} className="terminal-chip">{course}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const ProjectGrid = () => (
  <section className="reveal">
    {sectionLabel('02', 'Projects')}
    <div className="grid gap-4 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.name} to={project.href} className="interactive terminal-panel block overflow-hidden p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold text-[var(--color-primary)]">repo</p>
              <h3 className="mt-1 text-xl font-bold text-[var(--color-text)]">{project.name}</h3>
            </div>
            <ArrowUpRight size={18} className="text-[var(--color-muted)]" />
          </div>
          <p className="min-h-24 leading-7 text-[var(--color-muted)]">{project.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <span key={item} className="terminal-chip">{item}</span>
            ))}
          </div>
          <p className="mt-5 font-mono text-xs font-bold text-[var(--color-primary)]">status: {project.status}</p>
        </Link>
      ))}
    </div>
  </section>
);

const SkillMatrix = () => (
  <section className="reveal">
    {sectionLabel('03', 'Skills')}
    <div className="terminal-panel overflow-hidden">
      <TerminalHeader title="skills.json" />
      <div className="grid gap-4 p-5 sm:p-7 md:grid-cols-2">
        {skillGroups.map((group) => (
          <section key={group.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="mb-4 font-mono text-sm font-bold text-[var(--color-primary)]">
              "{group.label.toLowerCase()}": [
            </h3>
            <div className="flex flex-wrap gap-2 pl-4">
              {group.items.map((item) => (
                <span key={item} className="terminal-chip">{item}</span>
              ))}
            </div>
            <p className="mt-4 font-mono text-sm font-bold text-[var(--color-primary)]">]</p>
          </section>
        ))}
      </div>
    </div>
  </section>
);

const ContactPanel = () => (
  <section className="reveal">
    {sectionLabel('04', 'Contact')}
    <div className="terminal-panel overflow-hidden">
      <TerminalHeader title=".contactrc" />
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-4">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="interactive flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-mono text-sm"
            >
              <span className="text-[var(--color-muted)]">{link.label}</span>
              <span className="font-bold text-[var(--color-text)]">{link.value}</span>
            </a>
          ))}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-code)] p-5 font-mono text-sm text-[var(--color-code-text)]">
          <p className="text-[var(--color-lime)]">send --message</p>
          <p className="mt-4 leading-7 text-[var(--color-code-text)]/80">
            Open to project notes, course discussions, and personal website links.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[var(--color-lime)]">
            <Mail size={16} />
            <span>reachable via GitHub profile</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const Home: React.FC = () => {
  return (
    <div className="space-y-16">
      <HomeHero />
      <EducationTimeline />
      <ProjectGrid />
      <SkillMatrix />
      <ContactPanel />
    </div>
  );
};
