import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LandingContent.module.scss'

type FeatureSection = {
  title: string
  caption: string
  items: string[]
}

type MetricCard = {
  value: string
  label: string
}

type ContactFormState = {
  name: string
  clinic: string
  phone: string
}

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>

type IconName = 'growth' | 'control' | 'finance' | 'brain' | 'doctor' | 'message'

const iconMap: Record<IconName, string> = {
  growth:
    'M4 30h10V18H4zm17 0h10V10H21zm17 0h10V4H38z M8 8l9 7 8-9 8 4 9-10',
  control:
    'M26 6 8 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L26 6zm0 10v18m-8-9h16',
  finance:
    'M10 14h32M10 24h32M10 34h20 M18 8v32 M42 8v32',
  brain:
    'M18 18c0-6 4-10 8-10 2-4 8-5 12-2 6 0 10 5 10 11 0 4-2 7-5 9 1 5-2 10-8 10H24c-6 0-10-4-10-9 0-3 1-5 4-7-1-1-2-2-2-4z',
  doctor:
    'M26 8c4 0 7 3 7 7s-3 7-7 7-7-3-7-7 3-7 7-7zm-12 32c2-8 8-12 12-12s10 4 12 12',
  message:
    'M8 12h36v24H19l-7 8v-8H8z M16 20h20 M16 27h14',
}

const FeatureIcon = ({ name }: { name: IconName }) => {
  return (
    <span className={styles.iconBadge} aria-hidden="true">
      <svg viewBox="0 0 52 52" fill="none">
        <path d={iconMap[name]} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

const RevenueChart = () => {
  return (
    <svg viewBox="0 0 360 140" className={styles.chart} aria-hidden="true">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#165dfc" />
          <stop offset="100%" stopColor="#4c8dff" />
        </linearGradient>
      </defs>
      <path d="M18 118 C 80 96, 112 70, 170 78 S 268 48, 340 18" fill="none" stroke="url(#lineGradient)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="340" cy="18" r="7" fill="#165dfc" />
    </svg>
  )
}

const parseMetric = (value: string) => {
  const match = value.match(/^([^\d-+]*[+-]?)(\d+(?:\.\d+)?)(.*)$/)

  if (!match) {
    return { prefix: '', number: 0, suffix: value }
  }

  return {
    prefix: match[1],
    number: Number(match[2]),
    suffix: match[3],
  }
}

const AnimatedMetric = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const { prefix, number, suffix } = parseMetric(value)

  useEffect(() => {
    let frameId = 0
    const startedAt = performance.now()
    const duration = 1200

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)

      setDisplayValue(number * eased)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [number])

  return <>{`${prefix}${Math.round(displayValue)}${suffix}`}</>
}

const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.16 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={containerRef}
      className={`${styles.reveal} ${isVisible ? styles.revealVisible : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </section>
  )
}

export const LandingContent = () => {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    clinic: '',
    phone: '',
  })
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activePreviewTab, setActivePreviewTab] = useState(0)
  const [previewTilt, setPreviewTilt] = useState({ x: 0, y: 0 })

  const painPoints = t('landing.pain.points', { returnObjects: true }) as string[]
  const solutionItems = t('landing.solution.items', { returnObjects: true }) as string[]
  const solutionCards = t('landing.solution.cards', { returnObjects: true }) as string[]
  const aiItems = t('landing.ai.items', { returnObjects: true }) as string[]
  const aiStats = t('landing.ai.stats.items', { returnObjects: true }) as string[]
  const results = t('landing.results.items', { returnObjects: true }) as string[]
  const resultMetrics = t('landing.results.metrics', { returnObjects: true }) as MetricCard[]
  const dashboardSidebar = t('landing.hero.dashboard.sidebar', { returnObjects: true }) as string[]
  const dashboardFunnel = t('landing.hero.dashboard.funnel', { returnObjects: true }) as string[]
  const dashboardSchedule = t('landing.hero.dashboard.schedule', { returnObjects: true }) as string[]
  const dashboardAiItems = t('landing.hero.dashboard.aiItems', { returnObjects: true }) as string[]

  const featureSections: FeatureSection[] = [
    {
      title: t('landing.modules.administration.title'),
      caption: t('landing.modules.administration.caption'),
      items: t('landing.modules.administration.items', { returnObjects: true }) as string[],
    },
    {
      title: t('landing.modules.doctors.title'),
      caption: t('landing.modules.doctors.caption'),
      items: t('landing.modules.doctors.items', { returnObjects: true }) as string[],
    },
    {
      title: t('landing.modules.crm.title'),
      caption: t('landing.modules.crm.caption'),
      items: t('landing.modules.crm.items', { returnObjects: true }) as string[],
    },
    {
      title: t('landing.modules.director.title'),
      caption: t('landing.modules.director.caption'),
      items: t('landing.modules.director.items', { returnObjects: true }) as string[],
    },
    {
      title: t('landing.modules.telegram.title'),
      caption: t('landing.modules.telegram.caption'),
      items: t('landing.modules.telegram.items', { returnObjects: true }) as string[],
    },
  ]

  const switchLanguage = (language: 'ru' | 'en') => {
    void i18n.changeLanguage(language)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const fieldName = name as keyof ContactFormState

    setFormData((current) => ({
      ...current,
      [fieldName]: value,
    }))

    setErrors((current) => ({
      ...current,
      [fieldName]: undefined,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: ContactFormErrors = {}

    if (!formData.name.trim()) {
      nextErrors.name = t('landing.contact.errors.name')
    }

    if (!formData.clinic.trim()) {
      nextErrors.clinic = t('landing.contact.errors.clinic')
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = t('landing.contact.errors.phone')
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setIsSubmitted(false)
      return
    }

    startTransition(() => {
      setErrors({})
      setIsSubmitted(true)
      setFormData({
        name: '',
        clinic: '',
        phone: '',
      })
    })
  }

  const solutionIcons: IconName[] = ['control', 'finance', 'doctor', 'growth']
  const aiIcons: IconName[] = ['brain', 'control', 'growth']
  const benefitIcons: IconName[] = ['growth', 'control', 'finance']

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActivePreviewTab((current) => (current + 1) % 4)
    }, 2600)

    return () => window.clearInterval(intervalId)
  }, [])

  const handlePreviewMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5

    setPreviewTilt({ x: normalizedX * 10, y: normalizedY * -10 })
  }

  const handlePreviewLeave = () => {
    setPreviewTilt({ x: 0, y: 0 })
  }

  const previewSurfaceStyle = {
    '--tilt-x': `${previewTilt.x}deg`,
    '--tilt-y': `${previewTilt.y}deg`,
  } as CSSProperties

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <p className={styles.brand}>{t('landing.hero.badge')}</p>
        <nav className={styles.nav}>
          <a href="#pain">{t('landing.nav.pain')}</a>
          <a href="#product">{t('landing.nav.product')}</a>
          <a href="#ai">{t('landing.nav.ai')}</a>
          <a href="#crm">{t('landing.nav.crm')}</a>
          <a href="#results">{t('landing.nav.results')}</a>
        </nav>
        <div className={styles.languageSwitch}>
          <button type="button" onClick={() => switchLanguage('ru')} aria-label={t('landing.languageSwitch.switchRu')}>
            {t('landing.languageSwitch.ru')}
          </button>
          <button type="button" onClick={() => switchLanguage('en')} aria-label={t('landing.languageSwitch.switchEn')}>
            {t('landing.languageSwitch.en')}
          </button>
        </div>
      </header>

      <a href="#contact" className={styles.floatingCta}>
        {t('landing.floatingCta')}
      </a>

      <Reveal delay={0}>
        <section className={styles.hero}>
        <div className={styles.heroLead}>
          <span className={styles.eyebrow}>{t('landing.hero.caption')}</span>
          <h1>{t('landing.hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
          <div className={styles.ctaRow}>
            <a href="#contact" className={styles.primaryButton}>
              {t('landing.hero.primaryCta')}
            </a>
            <a href="#contact" className={styles.secondaryButton}>
              {t('landing.hero.secondaryCta')}
            </a>
          </div>
          <div className={styles.heroMetrics}>
            {resultMetrics.slice(0, 3).map((metric) => (
              <article key={metric.label} className={styles.heroMetricCard}>
                <strong>
                  <AnimatedMetric value={metric.value} />
                </strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
          <p className={styles.heroFootnote}>{t('landing.hero.trustedBy')}</p>
        </div>

        <div className={styles.heroPreview}>
          <div className={styles.heroPreviewIntro}>
            <div>
              <p className={styles.panelLabel}>{t('landing.hero.dashboard.period')}</p>
              <h2>{t('landing.hero.highlightTitle')}</h2>
            </div>
            <p>{t('landing.hero.highlightText')}</p>
          </div>

          <div
            className={styles.previewSurface}
            style={previewSurfaceStyle}
            onMouseMove={handlePreviewMove}
            onMouseLeave={handlePreviewLeave}
          >
            <div className={styles.previewTabs}>
              {dashboardSidebar.slice(0, 4).map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={index === activePreviewTab ? styles.previewTabActive : styles.previewTab}
                  onMouseEnter={() => setActivePreviewTab(index)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.previewGrid}>
              <article className={`${styles.previewRevenueCard} ${activePreviewTab === 0 ? styles.previewCardActive : ''}`}>
                <div className={styles.previewRevenueHead}>
                  <div>
                    <p className={styles.panelLabel}>{t('landing.hero.dashboard.title')}</p>
                    <strong className={styles.revenueValue}>{t('landing.hero.dashboard.revenueValue')}</strong>
                  </div>
                  <div className={styles.chartWrap}>
                    <RevenueChart />
                  </div>
                </div>
                <div className={styles.previewKpiRow}>
                  <article>
                    <span>{t('landing.hero.kpiRevenue')}</span>
                    <strong>+34%</strong>
                  </article>
                  <article>
                    <span>{t('landing.hero.kpiProfit')}</span>
                    <strong>+17%</strong>
                  </article>
                  <article>
                    <span>{t('landing.hero.kpiVisits')}</span>
                    <strong>+28%</strong>
                  </article>
                </div>
              </article>

              <article className={`${styles.previewInfoCard} ${activePreviewTab === 1 ? styles.previewCardActive : ''}`}>
                <p className={styles.panelLabel}>{t('landing.hero.dashboard.funnelTitle')}</p>
                <div className={styles.funnelRow}>
                  {dashboardFunnel.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>

              <article className={`${styles.previewInfoCard} ${activePreviewTab === 2 ? styles.previewCardActive : ''}`}>
                <p className={styles.panelLabel}>{t('landing.hero.dashboard.scheduleTitle')}</p>
                <ul className={styles.inlineList}>
                  {dashboardSchedule.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className={`${styles.previewInfoCard} ${activePreviewTab === 3 ? styles.previewCardActive : ''}`}>
                <p className={styles.panelLabel}>{t('landing.hero.dashboard.aiTitle')}</p>
                <ul className={styles.inlineList}>
                  {dashboardAiItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </div>
        </section>
      </Reveal>

      <Reveal delay={60}>
        <section className={styles.sectionBlock} id="pain">
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>{t('landing.nav.pain')}</span>
            <h2>{t('landing.pain.title')}</h2>
          </div>
          <p className={styles.sectionIntro}>{t('landing.pain.intro')}</p>
        </div>

        <div className={styles.painLayout}>
          <div className={styles.painGrid}>
            {painPoints.map((point) => (
              <article key={point} className={styles.painCard}>
                <span className={styles.painDot} />
                <p>{point}</p>
              </article>
            ))}
          </div>

          <article className={styles.summaryCard}>
            <p className={styles.panelLabel}>{t('landing.pain.summaryTitle')}</p>
            <h3>{t('landing.solution.title')}</h3>
            <p>{t('landing.pain.summaryText')}</p>
          </article>
        </div>
        </section>
      </Reveal>

      <Reveal delay={90}>
        <section className={styles.sectionBlock} id="product">
        <div className={styles.solutionLayout}>
          <div className={styles.solutionLead}>
            <span className={styles.eyebrow}>{t('landing.nav.product')}</span>
            <h2>{t('landing.solution.title')}</h2>
            <p className={styles.sectionIntro}>{t('landing.solution.description')}</p>
            <div className={styles.chipRow}>
              {solutionItems.map((item) => (
                <span key={item} className={styles.chip}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.architectureGrid}>
            {solutionCards.map((item, index) => (
              <article key={item} className={styles.architectureCard}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIndex}>{`0${index + 1}`}</span>
                  <FeatureIcon name={solutionIcons[index] ?? 'growth'} />
                </div>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <section className={styles.aiSection} id="ai">
        <div className={styles.aiLead}>
          <span className={styles.eyebrow}>{t('landing.nav.ai')}</span>
          <h2>{t('landing.ai.title')}</h2>
          <p className={styles.sectionIntro}>{t('landing.ai.intro')}</p>
        </div>

        <article className={styles.aiStatsCard}>
          <p className={styles.panelLabel}>{t('landing.ai.stats.title')}</p>
          <div className={styles.aiStatsRow}>
            {aiStats.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>

        <div className={styles.aiList}>
          {aiItems.map((item, index) => (
            <article key={item} className={styles.aiCard}>
              <FeatureIcon name={aiIcons[index] ?? 'brain'} />
              <p>{item}</p>
            </article>
          ))}
        </div>
        </section>
      </Reveal>

      <Reveal delay={150}>
        <section className={styles.modulesSection} id="crm">
        <div className={styles.modulesHeader}>
          <div>
            <span className={styles.eyebrow}>{t('landing.nav.crm')}</span>
            <h2>{t('landing.nav.crm')}</h2>
          </div>
          <p className={styles.sectionIntro}>{t('landing.hero.highlightText')}</p>
        </div>

        <article className={styles.featureModule}>
          <div className={styles.cardHead}>
            <span className={styles.cardIndex}>00</span>
            <FeatureIcon name="finance" />
          </div>
          <div>
            <h3>{featureSections[3].title}</h3>
            <p className={styles.moduleCaption}>{featureSections[3].caption}</p>
          </div>
          <ul>
            {featureSections[3].items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <div className={styles.modulesGrid}>
          {featureSections.filter((_, index) => index !== 3).map((section, index) => (
            <article key={section.title} className={styles.moduleCard}>
              <div className={styles.cardHead}>
                <span className={styles.cardIndex}>{`0${index + 1}`}</span>
                <FeatureIcon name={index === 0 ? 'control' : index === 1 ? 'doctor' : index === 2 ? 'growth' : 'message'} />
              </div>
              <h3>{section.title}</h3>
              <p className={styles.moduleCaption}>{section.caption}</p>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        </section>
      </Reveal>

      <Reveal delay={180}>
        <section className={styles.resultsSection} id="results">
        <div className={styles.resultsHeader}>
          <div>
            <span className={styles.eyebrow}>{t('landing.nav.results')}</span>
            <h2>{t('landing.results.title')}</h2>
          </div>
          <p className={styles.sectionIntro}>{t('landing.results.intro')}</p>
        </div>

        <div className={styles.metricsStrip}>
          {resultMetrics.map((metric) => (
            <article key={metric.label} className={styles.metricCard}>
              <strong>
                <AnimatedMetric value={metric.value} />
              </strong>
              <p>{metric.label}</p>
            </article>
          ))}
        </div>

        <div className={styles.resultsGrid}>
          {results.map((result) => (
            <article key={result} className={styles.resultCard}>
              <p>{result}</p>
            </article>
          ))}
        </div>

        <div className={styles.finalPanel}>
          <h2>{t('landing.finalCta.title')}</h2>
          <p>{t('landing.finalCta.subtitle')}</p>
          <div className={styles.ctaRow}>
            <a href="#contact" className={styles.primaryButton}>
              {t('landing.finalCta.primary')}
            </a>
            <a href="#contact" className={styles.secondaryButton}>
              {t('landing.finalCta.secondary')}
            </a>
          </div>
        </div>
        </section>
      </Reveal>

      <Reveal delay={210}>
        <section className={styles.contactSection} id="contact">
        <div className={styles.contactIntro}>
          <span className={styles.eyebrow}>{t('landing.floatingCta')}</span>
          <h2>{t('landing.contact.title')}</h2>
          <p>{t('landing.contact.subtitle')}</p>
          <div className={styles.contactBenefits}>
            {results.slice(0, 3).map((item, index) => (
              <article key={item} className={styles.benefitCard}>
                <FeatureIcon name={benefitIcons[index] ?? 'growth'} />
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span>{t('landing.contact.nameLabel')}</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('landing.contact.namePlaceholder')} />
            {errors.name ? <small>{errors.name}</small> : null}
          </label>

          <label className={styles.field}>
            <span>{t('landing.contact.clinicLabel')}</span>
            <input type="text" name="clinic" value={formData.clinic} onChange={handleChange} placeholder={t('landing.contact.clinicPlaceholder')} />
            {errors.clinic ? <small>{errors.clinic}</small> : null}
          </label>

          <label className={styles.field}>
            <span>{t('landing.contact.phoneLabel')}</span>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={t('landing.contact.phonePlaceholder')} />
            {errors.phone ? <small>{errors.phone}</small> : null}
          </label>

          <button type="submit" className={styles.submitButton}>
            {t('landing.contact.submit')}
          </button>

          <p className={styles.formNote}>{t('landing.contact.note')}</p>
          {isSubmitted ? <p className={styles.successMessage}>{t('landing.contact.success')}</p> : null}
        </form>
        </section>
      </Reveal>
    </main>
  )
}