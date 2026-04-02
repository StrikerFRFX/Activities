/// <reference path="../../../@types/premid/index.d.ts" />

import { Assets } from 'premid'

const presence = new Presence({
  clientId: '609774216430092298',
})

// ============================================================================
// Strings (cached)
// ============================================================================

let strings: Awaited<ReturnType<typeof getStrings>>

async function getStrings() {
  return presence.getStrings({
    accountSettings: 'osuppy.accountSettings',
    beatMapListing: 'osuppy.beatMapListing',
    beatMapLooking: 'osuppy.beatMapLooking',
    beatMapPacks: 'osuppy.beatMapPacks',
    browsing: 'general.browsing',
    buttonReadArticle: 'general.buttonReadArticle',
    buttonViewBeatmap: 'osuppy.buttonViewBeatmap',
    buttonViewProfile: 'general.buttonViewProfile',
    changelog: 'osuppy.changelog',
    chatting: 'osuppy.chatting',
    contests: 'osuppy.contests',
    countryRankings: 'osuppy.countryRankings',
    downloads: 'osuppy.pageDownloads',
    featuredArtists: 'osuppy.featuredArtists',
    for: 'osuppy.for',
    forums: 'osuppy.forums',
    friendList: 'osuppy.friendList',
    kudosuRankings: 'osuppy.kudosuRankings',
    livestreams: 'osuppy.livestreams',
    osuStore: 'osuppy.osuStore',
    otherProfile: 'osuppy.otherProfile',
    performanceRankings: 'osuppy.performanceRankings',
    rank: 'osuppy.rank',
    reading: 'general.reading',
    readingAnArticle: 'general.readingAnArticle',
    readingArticle: 'general.readingArticle',
    readingForum: 'osuppy.readingForum',
    readingNews: 'general.readingNews',
    scoreRankings: 'osuppy.scoreRankings',
    search: 'general.search',
    searchFor: 'general.searchFor',
    spotlights: 'osuppy.spotlights',
    support: 'osuppy.support',
    theirProfile: 'osuppy.theirProfile',
    tournaments: 'osuppy.tournaments',
    unsupportedPage: 'osuppy.unsupportedPage',
    view: 'general.view',
    viewingForum: 'osuppy.viewingForum',
    viewingHome: 'general.viewHome',
    watchLists: 'osuppy.watchLists',
    wikiMainPage: 'general.wikiMainPage',
  })
}

// ============================================================================
// Helpers
// ============================================================================

function safeText(el: Element | null, fallback = ''): string {
  return el?.textContent?.trim() || fallback
}

function format(str: string, ...args: string[]): string {
  return str.replace(/\{(\d+)\}/g, (_, i: string) => args[Number(i)] ?? '')
}

// ============================================================================
// Router
// ============================================================================

async function routePresence(data: PresenceData, pathname: string, href: string) {
  if (!strings) strings = await getStrings()

  delete data.buttons

  // ================= HOME =================
  if (pathname === '/' || pathname === '/home') {
    const search = document.querySelector<HTMLInputElement>('[type="search"]')

    if (search?.value) {
      data.details = strings.searchFor
      data.state = search.value
    }
    else {
      data.details = strings.viewingHome
    }

    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/home/download')) {
    data.details = strings.view
    data.state = strings.downloads
    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/home/news')) {
    const articleId = pathname.split('/')[3] ?? ''

    if (articleId) {
      const title = safeText(
        document.querySelector('div.news-show__info > h1'),
        strings.readingNews,
      )

      data.details = strings.readingArticle
      data.state = title
      data.smallImageKey = Assets.Reading
      data.buttons = [
        {
          label: strings.buttonReadArticle,
          url: href,
        },
      ]
    }
    else {
      data.details = strings.readingAnArticle
      data.smallImageKey = Assets.Search
    }

    return
  }

  if (pathname.startsWith('/home/support')) {
    data.details = strings.view
    data.state = strings.support
    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/home/search')) {
    const input = document.querySelector<HTMLInputElement>('#search-input')

    if (input?.value) {
      data.details = strings.searchFor
      data.state = input.value
    }
    else {
      data.details = strings.search
    }

    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/home/account/edit')) {
    data.details = strings.accountSettings
    return
  }

  if (pathname.startsWith('/home/changelog')) {
    data.details = strings.view
    data.state = strings.changelog
    data.smallImageKey = Assets.Reading
    return
  }

  if (pathname.startsWith('/home/friends')) {
    data.details = strings.view
    data.state = strings.friendList
    data.smallImageKey = Assets.Reading
    return
  }

  if (pathname.startsWith('/home/follows')) {
    data.details = strings.view
    data.state = strings.watchLists
    data.smallImageKey = Assets.Reading
    return
  }

  // ================= BEATMAPS =================
  if (pathname.includes('/beatmapsets')) {
    if (pathname === '/beatmapsets') {
      data.details = strings.browsing
      data.state = strings.beatMapListing
    }
    else {
      const title = safeText(document.querySelector('.beatmapset-header__details-text--title'))
      const diff = safeText(document.querySelector('.beatmapset-header__diff-name'))

      data.details = strings.beatMapLooking
      data.state = title && diff ? `${title} [${diff}]` : strings.beatMapListing
      data.buttons = [
        {
          label: strings.buttonViewBeatmap,
          url: href,
        },
      ]
    }

    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/beatmaps/packs')) {
    data.details = strings.browsing
    data.state = strings.beatMapPacks
    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/beatmaps/artists')) {
    data.details = strings.browsing
    data.state = strings.featuredArtists
    data.smallImageKey = Assets.Search
    return
  }

  // ================= STORE =================
  if (pathname.startsWith('/store')) {
    data.details = strings.browsing
    data.state = strings.osuStore
    data.smallImageKey = Assets.Search
    return
  }

  // ================= RANKINGS =================
  if (pathname.startsWith('/rankings')) {
    const parts = pathname.split('/').filter(Boolean)

    let gamemode = 'osu'
    let type = 'global'

    if (['osu', 'taiko', 'fruits', 'mania'].includes(parts[1] ?? '')) {
      gamemode = parts[1] ?? 'osu'
      type = parts[2] ?? 'global'
    }
    else {
      type = parts[1] ?? 'global'
      gamemode = parts[2] ?? 'osu'
    }

    type = type
      .replace('top-plays', 'top_plays')
      .replace('quickplay', 'quick_play')
      .replace('daily-challenge', 'daily_challenge')

    const selected = safeText(
      document.querySelector('div.u-ellipsis-overflow'),
      'All',
    )

    data.details = strings.browsing

    switch (type) {
      case 'global':
      case 'performance':
        data.state = `${strings.performanceRankings} ${format(strings.for, selected, gamemode)}`
        break

      case 'country':
        data.state = format(strings.countryRankings, gamemode)
        break

      case 'score':
        data.state = format(strings.scoreRankings, gamemode)
        break

      case 'charts':
        data.state = format(strings.spotlights, gamemode, selected)
        break

      case 'kudosu':
        data.state = strings.kudosuRankings
        break

      case 'top_plays':
        data.state = 'Top Plays'
        break

      case 'team':
        data.state = 'Team Rankings'
        break

      case 'playlists':
        data.state = 'Playlists'
        break

      case 'quick_play': {
        const room = parts[3] ?? ''
        data.state = room ? `Quick Play (${room})` : 'Quick Play'
        break
      }

      case 'daily_challenge':
        data.state = 'Daily Challenge'
        break

      default:
        data.state = strings.performanceRankings
        break
    }

    data.smallImageKey = Assets.Search
    return
  }

  // ================= MULTIPLAYER =================
  if (pathname.startsWith('/multiplayer/rooms')) {
    const selected = safeText(document.querySelector('div.u-ellipsis-overflow'))

    data.details = strings.browsing
    data.state = selected || 'Multiplayer Room'
    data.smallImageKey = Assets.Search
    return
  }

  // ================= COMMUNITY =================
  if (pathname.startsWith('/community/forums')) {
    const forumSegment = pathname.split('/')[3] ?? ''

    if (forumSegment === 'topics') {
      data.details = strings.readingForum
      data.smallImageKey = Assets.Reading
      return
    }

    if (!Number.isNaN(Number.parseInt(forumSegment, 10))) {
      const forumName = safeText(
        document.querySelector('h1.forum-title__name a.link--white.link--no-underline'),
        '',
      )

      data.details = strings.browsing
      data.state = format(strings.forums, forumName)
      data.smallImageKey = Assets.Search
      return
    }

    data.details = strings.browsing
    data.state = format(strings.forums, '')
    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/community/chat')) {
    data.details = strings.chatting
    return
  }

  if (pathname.startsWith('/community/contests')) {
    data.details = strings.browsing
    data.state = strings.contests
    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/community/livestreams')) {
    data.details = strings.browsing
    data.state = strings.livestreams
    data.smallImageKey = Assets.Search
    return
  }

  if (pathname.startsWith('/community/tournaments')) {
    data.details = strings.browsing
    data.state = strings.tournaments
    data.smallImageKey = Assets.Search
    return
  }

  // ================= WIKI =================
  if (pathname.startsWith('/wiki')) {
    const title = safeText(
      document.querySelector('[class="osu-md osu-md--wiki"] > h1'),
    )

    if (title) {
      data.details = strings.reading
      data.state = title
    }
    else if (pathname.includes('/Main_page')) {
      data.details = strings.reading
      data.state = strings.wikiMainPage
    }
    else {
      const sitemap = safeText(
        document.querySelector(
          'body > div.osu-layout__section.osu-layout__section--full.js-content.help_sitemap > div.osu-page.osu-page--generic',
        ),
      )

      data.details = strings.reading
      data.state = sitemap || strings.wikiMainPage
    }

    data.smallImageKey = Assets.Reading
    return
  }

  // ================= PROFILE =================
  if (pathname.startsWith('/users')) {
    const profileName = safeText(
      document.querySelector('.profile-info__name > span'),
    )
    const rank = safeText(
      document.querySelector('div:nth-child(1) > div.value-display__value > div'),
    )
    const pp = safeText(
      document.querySelector(
        'div.profile-detail__values.profile-detail__values--grid > div:nth-child(2) > div.value-display__value > div',
      ),
    )
    const currentUsername = safeText(document.querySelector('.user-card__username'))

    data.details = currentUsername === profileName
      ? strings.theirProfile.replace('{0}', profileName)
      : strings.otherProfile.replace('{0}', profileName)

    data.state = `${strings.rank.replace('{0}', rank)} / ${pp}pp`
    data.smallImageKey = Assets.Reading
    data.buttons = [
      {
        label: strings.buttonViewProfile,
        url: href,
      },
    ]
    return
  }

  // ================= DEFAULT =================
  data.details = strings.view
  data.state = strings.unsupportedPage
}

// ============================================================================
// Update Handler
// ============================================================================

presence.on('UpdateData', async () => {
  if (!strings) strings = await getStrings()

  const data: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/osu%20ppy/assets/logo.png',
  }

  const { pathname, href } = document.location
  const showButtons = presence.getSetting<boolean>('buttons')

  await routePresence(data, pathname, href)

  data.details ||= strings.browsing

  if (typeof data.details === 'string')
    data.details = data.details.slice(0, 128)

  if (typeof data.state === 'string')
    data.state = data.state.slice(0, 128)

  if (!showButtons)
    delete data.buttons

  presence.setActivity(data)
})