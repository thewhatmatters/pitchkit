"use client";

import {
  Avatar,
  Card,
  Chip,
  Stat,
  TextLink,
  cardTitleClasses,
} from "@/components/wmds";
import {
  PATTERN_CONTACT_CARD_CLASS,
  PATTERN_CONTACT_ROW_CLASS,
  PATTERN_CONTACT_ROWS_CLASS,
  PATTERN_IDENTITY_COPY_CLASS,
  PATTERN_IDENTITY_NAME_CLASS,
  PATTERN_IDENTITY_ROW_CLASS,
  PATTERN_IDENTITY_SECTION_CLASS,
  PATTERN_IDENTITY_TITLE_ROW_CLASS,
  PATTERN_KIT_POST_METRICS_CLASS,
  PATTERN_KIT_STAT_CLASS,
  PATTERN_POST_CARD_CLASS,
  PATTERN_POST_IMAGE_CLASS,
  PATTERN_POST_METRIC_CLASS,
  PATTERN_POST_METRIC_LABEL_CLASS,
  PATTERN_POST_METRIC_VALUE_CLASS,
  PATTERN_POSTS_HEADER_CLASS,
  PATTERN_POSTS_PANEL_CLASS,
  PATTERN_POSTS_SECTION_CLASS,
  PATTERN_SECTION_EYEBROW_CLASS,
  PATTERN_STATS_BAND_CLASS,
  PATTERN_SUPPORTING_CLASS,
} from "@/components/pattern-tokens";
import { formatCount, formatEngagementRate } from "@/lib/engagement";
import {
  shouldShowPastBrands,
  sourcedContactDetail,
  visibleBrandNames,
} from "@/lib/kit-chips";
import { publicObjectUrl } from "@/lib/r2";
import type { Media, User } from "@/lib/schema";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type ShareableKitProps = {
  user: User;
  posts: Media[];
  engagementRate: number | null;
  pastBrands?: readonly string[];
  contact?: string | null;
};

/**
 * Pattern — shareable PitchKit Show code (`examples-pitchkit--shareable-pitchkit`).
 * Public freeze: identity, followers / Engagement rate, selected posts
 * (likes + comments), Contact TextLink, Past brands. No owner management.
 */
export function ShareableKit({
  user,
  posts,
  engagementRate,
  pastBrands = [],
  contact = null,
}: ShareableKitProps) {
  const contactDetail = sourcedContactDetail(contact);
  const brands = visibleBrandNames(pastBrands);

  return (
    <>
      <section className={PATTERN_IDENTITY_SECTION_CLASS}>
        <div className={PATTERN_IDENTITY_ROW_CLASS}>
          <Avatar
            name={user.name}
            src={publicObjectUrl(user.avatar_r2_key) || undefined}
            size="lg"
          />
          <div className={PATTERN_IDENTITY_COPY_CLASS}>
            <div className={PATTERN_IDENTITY_TITLE_ROW_CLASS}>
              <h1 className={PATTERN_IDENTITY_NAME_CLASS}>{user.name}</h1>
              <Chip readOnly size="sm">
                Instagram
              </Chip>
            </div>
            <p className={PATTERN_SUPPORTING_CLASS}>@{user.handle}</p>
          </div>
        </div>
      </section>

      <div
        role="group"
        aria-label="Verified Instagram summary"
        className={PATTERN_STATS_BAND_CLASS}
      >
        <Stat
          className={PATTERN_KIT_STAT_CLASS}
          label="Followers"
          value={formatCount(user.followers)}
        />
        <Stat
          className={PATTERN_KIT_STAT_CLASS}
          label="Engagement rate"
          value={formatEngagementRate(engagementRate)}
        />
      </div>

      <section className={PATTERN_POSTS_SECTION_CLASS}>
        <div className={PATTERN_POSTS_HEADER_CLASS}>
          <div>
            <h2 className={cardTitleClasses}>Selected posts</h2>
            <p className={PATTERN_SUPPORTING_CLASS}>Proof from the current Instagram set.</p>
          </div>
        </div>
        <div className={PATTERN_POSTS_PANEL_CLASS}>
          {posts.map((post) => (
            <Card
              key={post.id}
              variant="outlined"
              shape="rounded"
              className={PATTERN_POST_CARD_CLASS}
            >
              <Card.Body>
                <img
                  className={PATTERN_POST_IMAGE_CLASS}
                  src={publicObjectUrl(post.r2_key)}
                  alt=""
                />
              </Card.Body>
              <Card.Footer>
                <div className={PATTERN_KIT_POST_METRICS_CLASS}>
                  {(
                    [
                      ["Likes", post.like_count],
                      ["Comments", post.comments_count],
                    ] as const
                  ).map(([label, value]) => (
                    <span key={label} className={PATTERN_POST_METRIC_CLASS}>
                      <span className={PATTERN_POST_METRIC_LABEL_CLASS}>{label}</span>
                      <span className={PATTERN_POST_METRIC_VALUE_CLASS}>
                        {compactNumber.format(value)}
                      </span>
                    </span>
                  ))}
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </section>

      {contactDetail ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Contact</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Creator-entered details for brand outreach.
              </p>
            </div>
          </div>
          <Card
            variant="outlined"
            padding="md"
            shape="rounded"
            className={PATTERN_CONTACT_CARD_CLASS}
          >
            <div className={PATTERN_CONTACT_ROWS_CLASS}>
              {contactDetail.kind === "email" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Email</span>
                  <TextLink href={contactDetail.href}>{contactDetail.value}</TextLink>
                </div>
              ) : null}
              {contactDetail.kind === "website" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Website</span>
                  <TextLink href={contactDetail.href} external>
                    {contactDetail.value}
                  </TextLink>
                </div>
              ) : null}
              {contactDetail.kind === "text" ? (
                <div className={PATTERN_CONTACT_ROW_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Contact</span>
                  <span className={PATTERN_SUPPORTING_CLASS}>{contactDetail.value}</span>
                </div>
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      {shouldShowPastBrands(brands) ? (
        <section className={PATTERN_POSTS_SECTION_CLASS}>
          <div className={PATTERN_POSTS_HEADER_CLASS}>
            <div>
              <h2 className={cardTitleClasses}>Past brands</h2>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Campaigns already shipped with this creator.
              </p>
            </div>
          </div>
          <div className={PATTERN_POSTS_PANEL_CLASS}>
            {brands.map((name) => (
              <Card
                key={name}
                variant="outlined"
                shape="rounded"
                className={PATTERN_POST_CARD_CLASS}
              >
                <Card.Header start={<h3 className={cardTitleClasses}>{name}</h3>} />
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
