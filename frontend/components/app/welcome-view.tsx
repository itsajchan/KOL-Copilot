'use client';

import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileCheck2, Mic, Play, ShieldCheck, Target, Upload } from 'lucide-react';
import styles from './medical-affairs-landing.module.css';

const LOGO_SRC = '/kol-copilot-logo-mark.svg';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

function VoiceControlPreview({
  transcript,
  state = 'Listening',
}: {
  transcript: string;
  state?: string;
}) {
  return (
    <div className="voice-control">
      <div className="voice-control__top">
        <span className="voice-control__button" aria-hidden="true">
          <Mic size={20} />
        </span>
        <div className="voice-control__meta">
          <div className="voice-control__status">{state} · 0:12</div>
          <div className="voice-control__transcript">{transcript}</div>
        </div>
      </div>
      <div className="wave" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="device">
      <div className="device__bar">
        <span className="device__dot" />
        <span className="device__title">
          RSV-PreF-301<span className="device__sub"> · Phase 3 · adults 60+</span>
        </span>
        <span className="badge">Indexed</span>
      </div>
      <div className="device__body">
        <VoiceControlPreview transcript="Find infectious-disease KOLs for this protocol" />
        <div className="kol-card">
          <div className="kol-card__header">
            <span className="kol-card__rank">01</span>
            <span className="avatar">EM</span>
            <div className="kol-card__identity">
              <div className="kol-card__name">Dr. Elena Marchetti</div>
              <div className="kol-card__inst">Karolinska Institutet</div>
            </div>
            <div className="kol-card__score">
              <div className="kol-card__score-value">92.4</div>
              <div className="kol-card__score-label">/ 100 Score</div>
            </div>
          </div>
          <div className="kol-card__meta-row">
            <span className="kol-card__meta">
              Vaccinology <span> · EU · Sweden</span>
            </span>
            <span className="badge badge--safe">Validated</span>
          </div>
          <div>
            <div className="score-bar" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="score-legend">
              <span>Trial 30</span>
              <span>Pubs 24</span>
              <span>Guidelines 18</span>
              <span>Recency 12</span>
            </div>
          </div>
          <p className="kol-card__rationale">
            Led Phase 3 prefusion-F efficacy work directly relevant to the protocol&apos;s primary
            endpoint.
          </p>
          <div className="kol-card__footer">
            <span className="citation-count">37 citations</span>
            <span style={{ flex: 1 }} />
            <span className="mini-action mini-action--ghost">View evidence</span>
            <span className="mini-action mini-action--primary">Generate brief</span>
          </div>
        </div>
        <div className="compliance-panel">
          <div className="compliance-panel__head">
            <div className="compliance-panel__title">Medical Affairs mode</div>
            <span className="badge badge--compliance">Audit ready</span>
          </div>
          <div className="check-list">
            <span>
              <CheckCircle2 /> Citation-required recommendations
            </span>
            <span>
              <CheckCircle2 /> No prescribing-volume targeting
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cite({ n }: { n: number }) {
  return (
    <sup className="cite" title="Traced to source evidence">
      [{n}]
    </sup>
  );
}

function VoiceCopilotPreview() {
  return (
    <div className="voice">
      <VoiceControlPreview transcript="Why is Dr. Chen ranked above Dr. Patel?" state="Thinking" />
      <div className="qa">
        <div className="qa__q">
          <span className="qa__role">You</span>
          <p>Why is Dr. Chen ranked above Dr. Patel?</p>
        </div>
        <div className="qa__a">
          <span className="qa__role qa__role--ai">
            <span className="qa__avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_SRC} alt="" width="20" height="20" />
            </span>
            KOL Copilot
          </span>
          <p>
            Dr. Chen has direct Phase 3 trial experience on the protocol&apos;s primary endpoint
            <Cite n={1} /> and authored two guideline statements in the disease state
            <Cite n={2} />. Dr. Patel&apos;s record is strong but weighted toward adjacent
            indications
            <Cite n={3} />.
          </p>
          <div className="qa__foot">
            <span className="qa__chip">3 citations</span>
            <span className="qa__guard">
              Reviewed against Medical Affairs guardrails · audit-logged
            </span>
          </div>
        </div>
        <div className="qa__q">
          <span className="qa__role">You</span>
          <p>Draft a compliant MSL pre-call brief.</p>
        </div>
        <div className="qa__a">
          <span className="qa__role qa__role--ai">
            <span className="qa__avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_SRC} alt="" width="20" height="20" />
            </span>
            KOL Copilot
          </span>
          <p className="qa__doc">
            Generated a non-promotional pre-call brief with scientific background, related trial
            experience, recent publications, and suggested scientific-exchange topics
            <Cite n={4} />.
          </p>
          <div className="qa__foot">
            <span className="qa__chip qa__chip--safe">Guardrail check passed</span>
            <span className="qa__guard">No prescribing-volume or promotional content</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StartButton({
  children,
  onStartCall,
  variant = 'primary',
}: {
  children: ReactNode;
  onStartCall: () => void;
  variant?: 'primary' | 'secondary' | 'ghost-dark';
}) {
  return (
    <button type="button" className={`btn btn--lg btn--${variant}`} onClick={onStartCall}>
      {children}
    </button>
  );
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className={styles.root}>
      <header className="nav">
        <div className="nav__inner">
          <a href="#top" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="KOL Copilot" />
            <span className="brand__name">KOL Copilot</span>
            <span className="brand__tag">Medical Affairs</span>
          </a>
          <nav className="nav__links" aria-label="Landing page sections">
            <a href="#how">How it works</a>
            <a href="#features">Capabilities</a>
            <a href="#voice">Voice copilot</a>
          </nav>
          <div className="nav__cta">
            <Link href="/dashboard" className="btn btn--secondary">
              <Target />
              Dashboard
            </Link>
            <button type="button" className="btn btn--primary" onClick={onStartCall}>
              <Upload />
              {startButtonText}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero__grid">
            <div>
              <span className="eyebrow">Protocol-aware KOL intelligence</span>
              <h1>KOL discovery that starts with the protocol.</h1>
              <p className="hero__lede">
                KOL Copilot turns Phase 3 protocol PDFs into evidence-backed maps of the
                investigators, external experts, and medical leaders most relevant to your study.
                Ask questions by voice, compare KOLs, and generate compliance-safe MSL briefs with
                every recommendation traced to source evidence.
              </p>
              <div className="hero__cta">
                <StartButton onStartCall={onStartCall}>
                  <Upload />
                  {startButtonText}
                </StartButton>
                <a href="#voice" className="btn btn--secondary btn--lg">
                  <Play />
                  Watch demo
                </a>
              </div>
              <div className="hero__trust">
                <ShieldCheck />
                Built for non-promotional scientific exchange · audit-logged
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        <section className="market">
          <div className="wrap market__inner">
            <span className="eyebrow">Market</span>
            <p className="market__lead">
              Built for a <span className="market__num">$2B-$4B</span> opportunity across{' '}
              <b>
                KOL intelligence, clinical site selection, and Medical Affairs workflow automation.
              </b>
            </p>
            <div className="market__cols">
              <div className="market__col">
                <div className="k">01 - Intelligence</div>
                <div className="v">KOL and KEE discovery</div>
              </div>
              <div className="market__col">
                <div className="k">02 - Trials</div>
                <div className="v">Clinical site selection</div>
              </div>
              <div className="market__col">
                <div className="k">03 - Operations</div>
                <div className="v">Medical Affairs automation</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <div className="section__head">
              <span className="eyebrow">How it works</span>
              <h2>Protocol in. Compliant expert intelligence out.</h2>
              <p>
                Upload a Phase 3 protocol. KOL Copilot extracts the disease state, endpoints,
                patient population, inclusion criteria, and scientific objectives. Then agentic
                workflows search public evidence, identify relevant experts, rank them against the
                protocol, and index everything for real-time conversational retrieval.
              </p>
            </div>

            <div className="pipe">
              {[
                {
                  num: '01',
                  title: 'Upload',
                  tags: ['Unsiloed'],
                  desc: 'Drop a Phase 3 protocol PDF. The document is parsed and structured the moment it lands.',
                },
                {
                  num: '02',
                  title: 'Extract',
                  tags: ['Structured parse'],
                  desc: 'The protocol is decomposed into the dimensions that drive relevance.',
                  chips: ['Disease state', 'Endpoints', 'Patient population', 'Inclusion criteria'],
                },
                {
                  num: '03',
                  title: 'Discover',
                  tags: ['OpenAI Agents SDK', 'Moss retrieval', 'Public evidence'],
                  desc: 'Agentic workflows search trials, publications, institutions, guidelines, and public records to identify experts against the study design.',
                },
                {
                  num: '04',
                  title: 'Index',
                  tags: ['Moss Index'],
                  desc: 'Findings populate a knowledge base and are indexed for real-time conversational retrieval.',
                },
                {
                  num: '05',
                  title: 'Engage',
                  optional: true,
                  tags: ['Resend', 'LiveKit voice'],
                  desc: 'Add experts to a compliant outreach workflow or generate non-promotional MSL-ready briefs.',
                },
              ].map((step) => (
                <div className="step" key={step.num}>
                  <div className="step__num">{step.num}</div>
                  <div className="step__body">
                    <div>
                      <div className="step__title">
                        {step.title}
                        {step.optional && <span className="opt">Optional</span>}
                      </div>
                      <div className="stack-row">
                        {step.tags.map((tag) => (
                          <span className="stack-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="step__desc">
                      {step.desc}
                      {step.chips && (
                        <div className="chips">
                          {step.chips.map((chip) => (
                            <span className="chip" key={chip}>
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section features" id="features">
          <div className="wrap">
            <div className="section__head">
              <span className="eyebrow">Capabilities</span>
              <h2>Designed for the way Medical Affairs actually works.</h2>
            </div>
            <div className="feat-grid">
              <div className="feat">
                <div className="feat__icon feat__icon--accent">
                  <Target />
                </div>
                <h3>Protocol-aware discovery</h3>
                <p>Find experts based on the actual study design, not static KOL lists.</p>
              </div>
              <div className="feat">
                <div className="feat__icon feat__icon--evidence">
                  <FileCheck2 />
                </div>
                <h3>Evidence-backed rankings</h3>
                <p>
                  Every recommendation carries citations from trials, publications, institutions,
                  guidelines, or public records.
                </p>
              </div>
              <div className="feat">
                <div className="feat__icon feat__icon--compliance">
                  <ShieldCheck />
                </div>
                <h3>Medical Affairs guardrails</h3>
                <p>
                  Built for non-promotional scientific exchange with compliance warnings, audit
                  trails, and no prescribing-volume targeting.
                </p>
              </div>
              <div className="feat">
                <div className="feat__icon feat__icon--accent">
                  <Mic />
                </div>
                <h3>Voice copilot</h3>
                <p>
                  Ask why one expert ranks above another or draft a compliant MSL pre-call brief by
                  voice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="voice">
          <div className="wrap">
            <div className="voice-grid">
              <div className="section__head">
                <span className="eyebrow">Voice copilot</span>
                <h2>Ask in plain language. Get grounded answers.</h2>
                <p>
                  Interrogate the ranking, compare experts side by side, and draft compliant
                  pre-call material by voice. Every claim is traced to source evidence and checked
                  against Medical Affairs guardrails.
                </p>
              </div>
              <VoiceCopilotPreview />
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="wrap closing__inner">
            <span className="eyebrow">The shift</span>
            <h2>
              KOL Copilot turns &quot;find the right doctors&quot; into a{' '}
              <span className="em">compliant, explainable, protocol-aware</span> workflow.
            </h2>
            <div className="closing__cta">
              <StartButton onStartCall={onStartCall}>
                <Upload />
                {startButtonText}
              </StartButton>
              <a href="#voice" className="btn btn--ghost-dark btn--lg">
                <Play />
                Watch demo
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <span className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" />
            <span className="brand__name">KOL Copilot</span>
          </span>
          <span className="footer__note">
            Non-promotional scientific exchange · no prescribing-volume targeting · audit-logged
          </span>
          <span className="footer__copy">© 2026</span>
        </div>
      </footer>
    </div>
  );
};
