import type { CSSProperties, ReactNode } from 'react';

import type { Deal, DealVisaType } from '@/services/deals/get-deals';

export type InstagramSlide = 'story';

const colors = {
  background: '#f7f2ea',
  card: '#fffdfc',
  ink: '#082f26',
  muted: '#47635c',
  green: '#075437',
  greenText: '#006233',
  greenSoft: '#e5f6ec',
  orange: '#f59f26',
  orangeSoft: '#fff4df',
  blue: '#1d4ed8',
  blueSoft: '#dbeafe',
  red: '#c1272d',
  redSoft: '#fee2e2',
  line: '#d8cdbc',
  beige: '#efe8dd',
  shadow: '#ded2bf',
};

const visaLabels: Record<DealVisaType, string> = {
  visa_free: 'Sans visa',
  evisa: 'eVisa',
  e_visa: 'eVisa',
  on_arrival: 'Visa a l arrivee',
  visa_on_arrival: 'Visa a l arrivee',
  visa_required: 'Visa requis',
};

const visaStyles: Record<DealVisaType, { background: string; color: string }> =
  {
    visa_free: { background: colors.greenSoft, color: colors.green },
    evisa: { background: colors.blueSoft, color: colors.blue },
    e_visa: { background: colors.blueSoft, color: colors.blue },
    on_arrival: { background: colors.greenSoft, color: colors.green },
    visa_on_arrival: { background: colors.greenSoft, color: colors.green },
    visa_required: { background: colors.redSoft, color: colors.red },
  };

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDate(date: string | null) {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return dateFormatter.format(parsedDate);
}

function formatPrice(price: number) {
  return price.toLocaleString('fr-MA').replace(/\s/g, '.');
}

function getVisaLabel(visaType: Deal['visaType']) {
  return visaType ? visaLabels[visaType] : 'Visa a verifier';
}

function getVisaStyle(visaType: Deal['visaType']) {
  return visaType
    ? visaStyles[visaType]
    : { background: colors.beige, color: colors.ink };
}

function getTransitAirport(tags: string[]) {
  const transitTag = tags.find((tag) =>
    tag.toLowerCase().startsWith('transit:'),
  );

  return transitTag?.split(':')[1]?.trim().toUpperCase() ?? null;
}

function getBaggageLabel(deal: Deal) {
  if (!deal.fare) {
    return 'Bagages a verifier';
  }

  const personal = deal.fare.personalItem ? '1 effet perso' : '0 effet perso';
  const cabin = deal.fare.cabinAllowed ? '1 cabine' : '0 cabine';
  const checked = deal.fare.checkedAllowed
    ? `${deal.fare.checkedCount} soute`
    : '0 soute';

  return `${personal}  |  ${cabin}  |  ${checked}`;
}

function getPriceFontSize(price: number) {
  return formatPrice(price).length > 7 ? 126 : 148;
}

const rootStyle: CSSProperties = {
  alignItems: 'center',
  background: colors.background,
  display: 'flex',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  height: '1920px',
  justifyContent: 'center',
  width: '1080px',
};

function Pill({
  children,
  style,
}: {
  children: string;
  style: { background: string; color: string };
}) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: style.background,
        borderRadius: 999,
        color: style.color,
        display: 'flex',
        fontSize: 30,
        fontWeight: 900,
        height: 68,
        justifyContent: 'center',
        padding: '0 30px',
      }}
    >
      {children}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      style={{
        background: colors.beige,
        borderRadius: 26,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 128,
        padding: '26px 30px',
        width: '100%',
      }}
    >
      <div
        style={{
          color: colors.muted,
          display: 'flex',
          fontSize: 21,
          fontWeight: 900,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ color: colors.ink, display: 'flex', fontSize: 34, fontWeight: 900 }}>
        {value}
      </div>
    </div>
  );
}

function StoryVisual({ deal }: { deal: Deal }) {
  const transitAirport = getTransitAirport(deal.tags);
  const priceFontSize = getPriceFontSize(deal.priceMad);

  return (
    <div style={rootStyle}>
      <div
        style={{
          background: colors.card,
          border: `3px solid ${colors.green}`,
          borderRadius: 46,
          boxShadow: `14px 16px 0 ${colors.shadow}`,
          color: colors.ink,
          display: 'flex',
          flexDirection: 'column',
          height: 1740,
          overflow: 'hidden',
          padding: 54,
          position: 'relative',
          width: 936,
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: colors.green, display: 'flex', fontSize: 34, fontWeight: 1000 }}>
              MEN MATAR
            </div>
            <div style={{ color: colors.orange, display: 'flex', fontSize: 34, fontWeight: 1000 }}>
              L MATAR
            </div>
          </div>
          <Pill style={{ background: colors.orangeSoft, color: colors.green }}>
            Deal voyage
          </Pill>
        </div>

        <div
          style={{
            alignItems: 'center',
            background: colors.green,
            borderRadius: 34,
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            marginTop: 48,
            padding: '46px 36px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 58,
              fontWeight: 1000,
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            {deal.fromCity} - {deal.toCity}
          </div>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 34,
              marginTop: 32,
            }}
          >
            <div style={{ display: 'flex', fontSize: 78, fontWeight: 1000 }}>
              {deal.fromAirport}
            </div>
            <div style={{ color: colors.orange, display: 'flex', fontSize: 58, fontWeight: 1000 }}>
              ↔
            </div>
            <div style={{ display: 'flex', fontSize: 78, fontWeight: 1000 }}>
              {deal.toAirport}
            </div>
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            background: colors.orangeSoft,
            border: `3px solid ${colors.orange}`,
            borderRadius: 34,
            display: 'flex',
            flexDirection: 'column',
            marginTop: 34,
            padding: '34px 24px',
            width: '100%',
          }}
        >
          <div
            style={{
              color: colors.muted,
              display: 'flex',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            A partir de
          </div>
          <div
            style={{
              alignItems: 'baseline',
              color: colors.greenText,
              display: 'flex',
              gap: 24,
              marginTop: 8,
            }}
          >
            <span style={{ display: 'flex', fontSize: priceFontSize, fontWeight: 1000, lineHeight: 1 }}>
              {formatPrice(deal.priceMad)}
            </span>
            <span style={{ display: 'flex', fontSize: 48, fontWeight: 1000 }}>
              MAD
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 34,
            width: '100%',
          }}
        >
          <InfoCard label="Depart" value={formatDate(deal.departureDate)} />
          <InfoCard label="Retour" value={formatDate(deal.returnDate)} />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            marginTop: 24,
            width: '100%',
          }}
        >
          <InfoCard
            label="Compagnie"
            value={deal.airlineDetails?.name ?? deal.airline ?? 'A verifier'}
          />
          <InfoCard
            label={transitAirport ? 'Escale' : 'Vol'}
            value={transitAirport ? `Transit via ${transitAirport}` : 'Direct ou selon disponibilite'}
          />
          <InfoCard label="Bagages" value={getBaggageLabel(deal)} />
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 34,
            width: '100%',
          }}
        >
          <Pill style={getVisaStyle(deal.visaType)}>
            {getVisaLabel(deal.visaType)}
          </Pill>
          <Pill style={{ background: colors.greenSoft, color: colors.green }}>
            Prix a verifier
          </Pill>
        </div>

        <div
          style={{
            alignItems: 'center',
            borderTop: `2px solid ${colors.line}`,
            color: colors.muted,
            display: 'flex',
            fontSize: 28,
            fontWeight: 800,
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 32,
            width: '100%',
          }}
        >
          <span>menmatarlmatar.ma</span>
          <span>Les prix peuvent fluctuer</span>
        </div>
      </div>
    </div>
  );
}

export function getInstagramSlideElement(deal: Deal) {
  return <StoryVisual deal={deal} />;
}

export function getInstagramSlideFilename(deal: Deal) {
  const base = `${deal.fromAirport}-${deal.toAirport}-${deal.priceMad}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${base}-story.png`;
}
