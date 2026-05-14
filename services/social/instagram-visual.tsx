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

function getPriceFontSize(price: number) {
  return formatPrice(price).length > 7 ? 126 : 146;
}

const rootStyle: CSSProperties = {
  alignItems: 'center',
  background: colors.beige,
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
        boxShadow: `0 12px 0 rgba(7, 84, 55, 0.12)`,
        color: style.color,
        display: 'flex',
        fontSize: 34,
        fontWeight: 1000,
        height: 84,
        justifyContent: 'center',
        padding: '0 34px',
        textTransform: 'uppercase',
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
        gap: 8,
        minHeight: 116,
        padding: '20px 34px',
        width: '100%',
      }}
    >
      <div
        style={{
          color: colors.muted,
          display: 'flex',
          fontSize: 21,
          fontWeight: 1000,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ color: colors.ink, display: 'flex', fontSize: 40, fontWeight: 1000 }}>
        {value}
      </div>
    </div>
  );
}

const baggageIconUrls = {
  personal: 'https://menmatarlmatar.ma/images/baggage-personal.svg',
  cabin: 'https://menmatarlmatar.ma/images/baggage-cabin.svg',
  checked: 'https://menmatarlmatar.ma/images/baggage-checked.svg',
};

function StoryBagIcon({ icon }: { icon: 'personal' | 'cabin' | 'checked' }) {
  return (
    <img
      alt=""
      height="42"
      src={baggageIconUrls[icon]}
      style={{ display: 'flex', objectFit: 'contain' }}
      width="42"
    />
  );
}

function BaggageItem({
  count,
  detail,
  included,
  icon,
}: {
  count: number;
  detail: string;
  included: boolean;
  icon: 'personal' | 'cabin' | 'checked';
}) {
  return (
    <div
      style={{
        alignItems: 'center',
        color: included ? colors.ink : colors.muted,
        display: 'flex',
        gap: 10,
      }}
    >
      <span style={{ display: 'flex', fontSize: 42, fontWeight: 1000 }}>
        {count}
      </span>
      <StoryBagIcon icon={icon} />
      <span
        style={{
          display: 'flex',
          fontSize: 22,
          fontWeight: 1000,
          lineHeight: 1.1,
          marginLeft: 4,
          textDecoration: included ? 'none' : 'line-through',
        }}
      >
        {detail}
      </span>
    </div>
  );
}

function BaggageCard({ deal }: { deal: Deal }) {
  const fare = deal.fare;

  return (
    <div
      style={{
        background: colors.beige,
        borderRadius: 26,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 166,
        padding: '20px 34px',
        width: '100%',
      }}
    >
      <div
        style={{
          color: colors.muted,
          display: 'flex',
          fontSize: 21,
          fontWeight: 1000,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        Bagages
      </div>
      {fare ? (
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 18,
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <BaggageItem
            count={fare.personalItem ? 1 : 0}
            detail="Effet perso"
            icon="personal"
            included={fare.personalItem}
          />
          <BaggageItem
            count={fare.cabinAllowed ? 1 : 0}
            detail={fare.cabinWeightKg ? `Cabine ${fare.cabinWeightKg}kg` : 'Cabine'}
            icon="cabin"
            included={fare.cabinAllowed}
          />
          <BaggageItem
            count={fare.checkedAllowed ? fare.checkedCount : 0}
            detail={
              fare.checkedWeightKg ? `Soute ${fare.checkedWeightKg}kg` : 'Soute'
            }
            icon="checked"
            included={fare.checkedAllowed}
          />
        </div>
      ) : (
        <div
          style={{
            color: colors.muted,
            display: 'flex',
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          Bagages a verifier
        </div>
      )}
    </div>
  );
}

function StoryVisual({ deal }: { deal: Deal }) {
  const transitAirport = getTransitAirport(deal.tags);
  const priceFontSize = getPriceFontSize(deal.priceMad);
  const airlineName =
    deal.airlineDetails?.name ?? deal.airline ?? 'A verifier';

  return (
    <div style={rootStyle}>
      <div
        style={{
          background: colors.card,
          border: `3px solid ${colors.green}`,
          borderRadius: 46,
          boxShadow: `17px 23px 0 ${colors.shadow}`,
          color: colors.ink,
          display: 'flex',
          flexDirection: 'column',
          height: 1785,
          overflow: 'hidden',
          padding: 34,
          position: 'relative',
          width: 970,
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            minHeight: 175,
            width: '100%',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              background: '#fffaf1',
              border: '4px solid rgba(7, 84, 55, 0.15)',
              borderRadius: 45,
              boxShadow: `0 16px 0 rgba(7, 84, 55, 0.12)`,
              display: 'flex',
              height: 164,
              justifyContent: 'center',
              width: 164,
            }}
          >
            <img
              alt="Men Matar L Matar"
              height={140}
              src="https://menmatarlmatar.ma/images/favicon-96x96.png"
              style={{ objectFit: 'contain' }}
              width={140}
            />
          </div>
          <Pill style={getVisaStyle(deal.visaType)}>
            {getVisaLabel(deal.visaType)}
          </Pill>
        </div>

        <div
          style={{
            alignItems: 'center',
            background: colors.green,
            borderRadius: 62,
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            marginTop: 18,
            padding: '36px 40px 40px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 1000,
              lineHeight: 1,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {deal.fromCity} - {deal.toCity}
          </div>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 36,
              marginTop: 28,
            }}
          >
            <div style={{ display: 'flex', fontSize: 108, fontWeight: 1000, lineHeight: 1 }}>
              {deal.fromAirport}
            </div>
            <div style={{ color: colors.orange, display: 'flex', fontSize: 78, fontWeight: 1000 }}>
              ↔
            </div>
            <div style={{ display: 'flex', fontSize: 108, fontWeight: 1000, lineHeight: 1 }}>
              {deal.toAirport}
            </div>
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            background: colors.orangeSoft,
            border: `8px solid ${colors.orange}`,
            borderRadius: 62,
            boxShadow: `0 17px 0 rgba(245, 159, 38, 0.2)`,
            display: 'flex',
            flexDirection: 'column',
            marginTop: 30,
            padding: '26px 28px 34px',
            width: '100%',
          }}
        >
          <div
            style={{
              color: colors.muted,
              display: 'flex',
              fontSize: 40,
              fontWeight: 1000,
              textTransform: 'uppercase',
            }}
          >
            A partir de
          </div>
          <div
            style={{
              alignItems: 'baseline',
              color: colors.greenText,
              display: 'flex',
              gap: 26,
              marginTop: 8,
            }}
          >
            <span style={{ display: 'flex', fontSize: priceFontSize, fontWeight: 1000, lineHeight: 1 }}>
              {formatPrice(deal.priceMad)}
            </span>
            <span style={{ display: 'flex', fontSize: 52, fontWeight: 1000 }}>
              MAD
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            marginTop: 30,
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
            gap: 14,
            marginTop: 14,
            width: '100%',
          }}
        >
          <InfoCard
            label="Compagnie"
            value={airlineName}
          />
          <InfoCard
            label={transitAirport ? 'Escale' : 'Vol'}
            value={transitAirport ? `Transit via ${transitAirport}` : 'VOL DIRECT'}
          />
          <BaggageCard deal={deal} />
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
