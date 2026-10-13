"use client";

import {
  ContactLink,
  LegalCopy,
  LegalList,
  LegalSection,
  ToConfirm,
} from "@/components/legal-page";

export const PRIVACY_LAST_UPDATED = "October 13, 2026";

/** Data deletion section — Meta "data deletion instructions" URL is /privacy#delete. */
export function DeletionSection() {
  return (
    <LegalSection id="delete" title="Disconnecting and deleting your data">
      <LegalCopy>
        <strong>Disconnect</strong> (on Insights or Settings) does the following right away:
      </LegalCopy>
      <LegalList
        items={[
          "Signs you out of Pitchkit.",
          "Deletes the Instagram access tokens we stored for you.",
          "Stops Pitchkit from fetching any more data from Instagram.",
          "Takes your public kit offline. Its link shows “not found”.",
        ]}
      />
      <LegalCopy>
        Disconnect does <strong>not</strong> yet erase the rest of what we stored: your
        profile details, post copies and metrics, Insights, audience breakdowns, intro, and
        past brands. If you connect again later, that saved data comes back.
      </LegalCopy>
      <LegalCopy>
        To have everything erased, email <ContactLink /> with your Instagram username and
        ask for deletion. We will delete your stored data and confirm by email within 30
        days. <ToConfirm />
      </LegalCopy>
      <LegalCopy>
        You can also remove Pitchkit&apos;s access from Instagram itself: in the Instagram
        app, go to Settings, then Apps and websites, and remove Pitchkit. That stops our
        access, but it does not erase data we already stored, so email us as well.
      </LegalCopy>
    </LegalSection>
  );
}

export function PrivacyContent() {
  return (
    <>
      <LegalSection title="Who we are">
        <LegalCopy>
          Pitchkit (pitchkit.app) turns a creator&apos;s Instagram account into a media kit
          they can send to brands. Pitchkit is operated by WhatMatters. Questions about this
          policy or your data: <ContactLink />.
        </LegalCopy>
        <LegalCopy>Last updated {PRIVACY_LAST_UPDATED}.</LegalCopy>
      </LegalSection>

      <LegalSection title="What Pitchkit never does">
        <LegalList
          items={[
            "Pitchkit never posts, comments, or likes on Instagram for you. It only reads.",
            "We don’t read your DMs, who you follow, or who unfollowed you.",
            "We don’t sell your data, and we don’t share it with advertisers.",
          ]}
        />
      </LegalSection>

      <LegalSection title="How you sign in">
        <LegalCopy>
          You sign in with Instagram (Instagram Login for Business or Creator accounts). We
          ask for two permissions only:
        </LegalCopy>
        <LegalList
          items={[
            <>
              <code>instagram_business_basic</code>: your profile and your posts.
            </>,
            <>
              <code>instagram_business_manage_insights</code>: your Instagram Insights.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="What we collect">
        <LegalList
          items={[
            "Profile: Instagram user ID, username, name, account type, profile picture link, follower count, and post count.",
            "Posts: post ID, caption, type, link, date, like and comment counts, and image and video links (including carousel items).",
            "Post Insights: reach, views, saves, and shares for each post.",
            "Account Insights: your daily reach for the last 30 days.",
            "Audience: your followers’ age, gender, country, and city, as percentage breakdowns that Instagram provides. We never see individual followers.",
            "What you add in Pitchkit: your intro, past brands, kit theme, and which posts you hide from your kit.",
            "Your Instagram access token, encrypted (AES-256-GCM) before we store it.",
          ]}
        />
      </LegalSection>

      <LegalSection title="How often we update it">
        <LegalCopy>
          We fetch fresh data from Instagram when you open Insights and your data is more
          than 6 hours old, or when you tap Refresh. Pitchkit does not run a background job
          to fetch your data when you aren&apos;t using it.
        </LegalCopy>
      </LegalSection>

      <LegalSection title="Where it is stored">
        <LegalCopy>
          Pitchkit runs on Cloudflare. Your data is stored in Cloudflare Workers KV. We have
          also built storage in a Postgres database (Supabase, connected through Cloudflare
          Hyperdrive), but it is not switched on yet. When it is, your account and post
          records will be kept there and the rest will stay in Cloudflare KV.
        </LegalCopy>
        <LegalCopy>
          Cloudflare keeps request logs for running and debugging the service. <ToConfirm />
        </LegalCopy>
      </LegalSection>

      <LegalSection title="What your public kit shows">
        <LegalCopy>
          Your kit at pitchkit.app/k/your-username can be viewed by anyone who has the link.
          It shows your name, username, follower count, engagement rate, typical reach and
          saves, a 30-day reach chart, your top countries, selected posts with their like
          and comment counts, your intro, and your past brands. You can hide any post from
          it.
        </LegalCopy>
        <LegalCopy>
          Your Insights page is private to you. Brands only see the kit, never your full
          Insights.
        </LegalCopy>
      </LegalSection>

      <LegalSection title="Cookies">
        <LegalList
          items={[
            <>
              <code>pitchkit_session</code>: keeps you signed in, for up to 30 days.
            </>,
            <>
              <code>pitchkit_oauth_state</code>: protects the Instagram sign-in step. It
              lasts 10 minutes.
            </>,
            <>
              <code>pitchkit_hidden</code>: remembers which posts you hid, for up to 30
              days.
            </>,
          ]}
        />
        <LegalCopy>
          All three cookies are HttpOnly and SameSite=Lax. Pitchkit uses no analytics,
          advertising, or third-party tracking cookies.
        </LegalCopy>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <LegalCopy>
          We keep your data while your account is connected. When Instagram stops returning
          a post, we drop it at the next refresh. We don&apos;t yet delete data
          automatically after you disconnect. See below for how to have it erased.
          <ToConfirm />
        </LegalCopy>
      </LegalSection>

      <DeletionSection />

      <LegalSection title="Changes">
        <LegalCopy>
          If we change this policy, we will update the date at the top of this page. For
          any question, email <ContactLink />.
        </LegalCopy>
      </LegalSection>
    </>
  );
}
