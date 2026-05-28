// ── Premium collection content layer ────────────────────────────────────────
// Presentational, marketing-only copy for the premium draw detail pages. This
// is the SAME established pattern used for bottle data and hero imagery in
// `giveaways.ts`: the draw itself (existence, pricing, dates, capacity,
// visibility) remains 100% DB-driven via GET /api/giveaways — only the
// editorial enrichment (story, highlights, FAQ) lives here, keyed by the
// stable giveaway *name* so it is consistent across environments.
//
// There are NO per-collection page templates. Every collection renders through
// the same reusable sections; this map only supplies copy. Any draw without an
// entry here falls back to `genericContent()`, so new DB-driven draws still
// render a complete, sensible premium page.

export interface IncludedItem {
  icon: string;
  title: string;
  body: string;
}

export interface HighlightCard {
  icon: string;
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CollectionContent {
  /** Small eyebrow label above the hero title. */
  kicker: string;
  /** Optional override for the hero blurb (defaults to the DB description). */
  shortDescription?: string;
  /** Intro paragraph for the "What's Included" section. */
  includedIntro: string;
  /**
   * Used by "What's Included" ONLY when a collection has no bottle imagery
   * (e.g. experiences or collections awaiting product shots). Collections with
   * bottle data render the bottle grid instead.
   */
  includedItems?: IncludedItem[];
  /** "Why This Collection Matters" editorial story. */
  story: {
    heading: string;
    paragraphs: string[];
    quote?: string;
  };
  /** "Collection Highlights" trust cards. */
  highlights: HighlightCard[];
  /** Collection-specific FAQ. */
  faq: FaqItem[];
}

// Shared trust highlights reused across collections + the generic fallback.
const TRUST_HIGHLIGHTS: HighlightCard[] = [
  {
    icon: 'gem',
    title: '100% Authentic',
    body: 'Every bottle is sourced through official channels and verified genuine — no replicas, no grey-market imports. What you see is exactly what ships.',
  },
  {
    icon: 'shield',
    title: 'Provably Fair Draw',
    body: 'Winners are selected by a cryptographically secure, independently verifiable random draw — broadcast live and recorded. Every ticket carries equal odds.',
  },
  {
    icon: 'truck',
    title: 'Insured, Tracked Delivery',
    body: 'Your prize is professionally packed, fully insured and shipped tracked to your door — handled with the care a collection of this calibre deserves.',
  },
  {
    icon: 'lock',
    title: 'Responsible by Design',
    body: 'Strictly 18+. A free postal entry route is always available, and we cap tickets per person to keep every draw fair and responsible.',
  },
];

// Shared FAQ entries reused across collections + the generic fallback.
const COMMON_FAQ: FaqItem[] = [
  {
    q: 'How are winners chosen?',
    a: "On the draw's close date a winner is selected using a cryptographically secure, independently verifiable random number generator. The draw is broadcast live and recorded, and every ticket has exactly equal odds.",
  },
  {
    q: 'Is there a free entry route?',
    a: 'Yes. A free postal entry route is always available for every draw — full details are set out in our Official Contest Rules. No purchase is necessary to enter or win.',
  },
  {
    q: 'How is the prize delivered?',
    a: 'The full collection is professionally packed, fully insured and shipped tracked to the winner. We coordinate delivery directly with you after the draw to a UK or Republic of Ireland address.',
  },
  {
    q: 'Who can enter?',
    a: 'Entrants must be 18 or older and legally resident in the United Kingdom or Republic of Ireland at the time of entry. A short skill-testing question must be answered correctly to qualify.',
  },
];

const CONTENT: Record<string, CollectionContent> = {
  'The Clonakilty Collection': {
    kicker: 'West Cork · Atlantic Coast Single Malt',
    includedIntro:
      "The complete Clonakilty Distillery range — seven Atlantic-coast expressions, from the everyday-luxurious to the rare aged single malt — delivered as one curated collection.",
    story: {
      heading: 'Whiskey shaped by the wild Atlantic',
      paragraphs: [
        'Clonakilty is a family distillery on the rugged West Cork coast, where ninth-generation farmers turned centuries of land knowledge into spirit. Their warehouses sit metres from the Atlantic, and that sea air works its way into every cask — softening the whiskey, rounding the spice, leaving a faint coastal salinity that you simply cannot manufacture inland.',
        'This collection spans the full arc of their craft: the approachable Galley Head expressions, the cask-finished Port and Cognac releases, and the prized 21-Year-Old Single Malt that anchors the set. Together they tell the story of a distillery that has become one of Ireland\'s most awarded in barely a decade.',
      ],
      quote: 'Maritime maturation you can taste — soft, coastal, unmistakably West Cork.',
    },
    highlights: TRUST_HIGHLIGHTS,
    faq: [
      {
        q: 'What does the Clonakilty Collection include?',
        a: 'The complete range of seven Atlantic-coast expressions — the 21-Year-Old Single Malt, Single Pot Still, Cognac Cask, Double Oak, Port Cask, and both Galley Head bottlings — shipped together as one collection.',
      },
      ...COMMON_FAQ,
    ],
  },

  'The Patrón Collection': {
    kicker: 'Jalisco, Mexico · Handcrafted Tequila',
    includedIntro:
      'Fifteen iconic expressions from the world-renowned Patrón estate — from the crisp Silver to the ultra-rare Gran Patrón Burdeos, plus the Roca trio, Estate Release and the XO Café and Citrónge liqueurs.',
    story: {
      heading: 'The standard the world measures tequila against',
      paragraphs: [
        'In the highlands of Jalisco, Patrón is still made the slow way: only the finest Weber Blue Agave, hand-harvested at full maturity, then crushed — in part — by the ancient tahona, a two-tonne volcanic stone wheel. It is a process most distilleries abandoned decades ago for being too costly and too slow. Patrón kept it, because nothing else produces that signature smoothness.',
        'This collection is the full spectrum of that obsession: from the bright, citrus-fresh Silver to the Bordeaux-finished Gran Patrón Burdeos — one of the most coveted tequilas on earth. Fifteen bottles that move from cocktail-hour staple to display-cabinet trophy.',
      ],
      quote: 'From tahona stone to crystal decanter — the complete Patrón spectrum.',
    },
    highlights: TRUST_HIGHLIGHTS,
    faq: [
      {
        q: 'What does the Patrón Collection include?',
        a: 'Fifteen expressions in total — Silver, Reposado, Añejo, Extra Añejo, Cristalino, El Cielo, El Alto, Gran Patrón Platinum, Piedra and Burdeos, the Roca trio, Estate Release, Ahumado, plus the Citrónge and XO Café liqueurs.',
      },
      ...COMMON_FAQ,
    ],
  },

  'The Macallan Luxury Scotch Collection': {
    kicker: 'Speyside, Scotland · Single Malt Scotch',
    includedIntro:
      'An extraordinary line-up of premium Macallan Scotch whiskies — rare cask expressions, aged single malts and collector favourites, curated into one luxury collection.',
    includedItems: [
      {
        icon: 'gem',
        title: '12 Year Double Cask',
        body: 'Matured in hand-picked American and European sherry-seasoned oak. Honey, citrus and vanilla with the signature Macallan smoothness.',
      },
      {
        icon: 'wine',
        title: '12 Year Sherry Oak',
        body: 'Exclusively sherry-seasoned oak from Jerez. Rich dried fruits, wood spice and chocolate — the classic Macallan profile.',
      },
      {
        icon: 'gem',
        title: '15 Year Double Cask',
        body: 'A deeper, more layered double-cask expression — dried fruit, ginger and warm oak with a long, elegant finish.',
      },
      {
        icon: 'crown',
        title: '18 Year Sherry Oak',
        body: 'One of the most revered age statements in Scotch. Decades of sherry-oak maturation deliver intense fruit, spice and depth.',
      },
      {
        icon: 'star',
        title: 'Rare Cask',
        body: 'Drawn from a small selection of the most exceptional sherry-seasoned casks. Opulent, jammy and intensely aromatic.',
      },
      {
        icon: 'sparkles',
        title: 'Harmony Collection',
        body: 'A limited-edition celebration of craft and sustainability — a collector\'s centrepiece and a fitting crown for the set.',
      },
    ],
    story: {
      heading: 'The most collectible name in single malt',
      paragraphs: [
        'On a Speyside estate above the River Spey, The Macallan has spent nearly two centuries perfecting a singular obsession: exceptional oak. The distillery invests more in its casks than almost any other in Scotland, personally overseeing the sherry-seasoning of its barrels in Jerez — because, as they put it, the cask gives the whisky up to eighty percent of its character.',
        'That uncompromising approach has made Macallan the most coveted single malt on the planet, with bottles routinely breaking world auction records. This collection gathers the expressions that define it — from the approachable 12 Year to the legendary 18 Year Sherry Oak and the limited Harmony release.',
      ],
      quote: 'Nearly two centuries of Speyside craft, gathered into a single collection.',
    },
    highlights: TRUST_HIGHLIGHTS,
    faq: [
      {
        q: 'What does the Macallan Collection include?',
        a: 'A curated line-up of premium Macallan expressions — the 12 Year Double Cask, 12 Year Sherry Oak, 15 Year Double Cask, 18 Year Sherry Oak, Rare Cask and the limited Harmony Collection.',
      },
      ...COMMON_FAQ,
    ],
  },
};

/**
 * Generic fallback so any DB-driven draw (including ones added later from the
 * admin panel) still renders a complete, premium page without a bespoke entry.
 */
function genericContent(): CollectionContent {
  return {
    kicker: 'Premium Collection · Limited Tickets',
    includedIntro:
      'A curated collection of premium spirits, professionally packed and shipped insured to one lucky winner.',
    // Generic draws have no bottle imagery, so always supply descriptive cards
    // here — guarantees the "What's Included" section is never empty.
    includedItems: [
      {
        icon: 'gem',
        title: 'A Curated Premium Collection',
        body: 'A hand-selected line-up of sought-after bottles, chosen for quality and collectability — delivered together as one complete prize.',
      },
      {
        icon: 'shield',
        title: 'Verified Genuine',
        body: 'Every bottle is sourced through official channels and verified authentic. No replicas, no grey-market imports — exactly what you see.',
      },
      {
        icon: 'truck',
        title: 'Insured, Tracked Delivery',
        body: 'Your prize is professionally packed, fully insured and shipped tracked to your door anywhere in the UK or Republic of Ireland.',
      },
    ],
    story: {
      heading: 'A collection worth winning',
      paragraphs: [
        'Every PrizePour draw is built around spirits we would be proud to own ourselves — sourced through official channels, verified genuine, and presented as one complete collection for a single winner.',
        'Enter for the chance to win it outright, with provably fair odds and insured delivery to your door.',
      ],
    },
    highlights: TRUST_HIGHLIGHTS,
    faq: COMMON_FAQ,
  };
}

export function getCollectionContent(name?: string | null): CollectionContent {
  if (name && CONTENT[name]) return CONTENT[name];
  return genericContent();
}
