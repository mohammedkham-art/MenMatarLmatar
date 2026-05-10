import type { CSSProperties, ReactNode } from 'react';

import type { Deal, DealVisaType } from '@/services/deals/get-deals';

export type InstagramSlide = 'outbound' | 'return' | 'cta';

const colors = {
  background: '#f7f2ea',
  card: '#fffdfc',
  ink: '#0d1b2a',
  muted: '#4a5b57',
  green: '#006233',
  greenText: '#159947',
  greenSoft: '#ddf6e5',
  blue: '#1d4ed8',
  blueSoft: '#dbeafe',
  red: '#c1272d',
  redSoft: '#fee2e2',
  line: '#b7d5c0',
  beige: '#efe8dd',
  shadow: '#e6ddcf',
};

const visaLabels: Record<DealVisaType, string> = {
  visa_free: 'Sans visa',
  evisa: 'eVisa',
  e_visa: 'eVisa',
  on_arrival: 'Visa à l’arrivée',
  visa_on_arrival: 'Visa à l’arrivée',
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
  return visaType ? visaLabels[visaType] : 'Visa à vérifier';
}

function getVisaStyle(visaType: Deal['visaType']) {
  return visaType
    ? visaStyles[visaType]
    : { background: colors.beige, color: colors.ink };
}

function splitPrice(price: number) {
  const formattedPrice = formatPrice(price);

  return formattedPrice.length > 8
    ? { amountFontSize: 126, unitFontSize: 50 }
    : { amountFontSize: 158, unitFontSize: 56 };
}

const rootStyle: CSSProperties = {
  alignItems: 'center',
  background: colors.background,
  display: 'flex',
  height: '1350px',
  justifyContent: 'center',
  width: '1080px',
};

const cardStyle: CSSProperties = {
  alignItems: 'center',
  background: colors.card,
  border: `3px solid ${colors.green}`,
  borderRadius: '42px',
  boxShadow: `10px 12px 0 ${colors.shadow}`,
  color: colors.ink,
  display: 'flex',
  flexDirection: 'column',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  height: '1202px',
  position: 'relative',
  width: '908px',
};

const topBadgeStyle: CSSProperties = {
  alignItems: 'center',
  background: colors.card,
  border: `3px solid ${colors.green}`,
  borderRadius: '24px',
  display: 'flex',
  fontSize: '30px',
  fontWeight: 700,
  height: '74px',
  justifyContent: 'center',
  left: '214px',
  position: 'absolute',
  top: '-34px',
  width: '480px',
};

function LineTitle({ children }: { children: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 42,
        marginTop: 82,
      }}
    >
      <div
        style={{ background: colors.line, display: 'flex', height: 2, width: 82 }}
      />
      <div style={{ display: 'flex', fontSize: 42, fontWeight: 700 }}>
        {children}
      </div>
      <div
        style={{ background: colors.line, display: 'flex', height: 2, width: 82 }}
      />
    </div>
  );
}

function RouteRow({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 48,
        width: 770,
      }}
    >
      <div style={{ display: 'flex', fontSize: 104, fontWeight: 900 }}>
        {from}
      </div>
      <div
        style={{
          color: colors.green,
          display: 'flex',
          fontSize: 54,
          fontWeight: 900,
        }}
      >
        ✈
      </div>
      <div style={{ display: 'flex', fontSize: 104, fontWeight: 900 }}>
        {to}
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 30,
        marginTop: 44,
      }}
    >
      <div
        style={{ background: colors.line, display: 'flex', height: 2, width: 350 }}
      />
      <div
        style={{
          background: colors.green,
          borderRadius: 999,
          display: 'flex',
          height: 20,
          width: 20,
        }}
      />
      <div
        style={{ background: colors.line, display: 'flex', height: 2, width: 350 }}
      />
    </div>
  );
}

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
        fontSize: 32,
        fontWeight: 800,
        height: 74,
        justifyContent: 'center',
        minWidth: 350,
        padding: '0 32px',
      }}
    >
      {children}
    </div>
  );
}


function Base({
  badge,
  children,
}: {
  badge: string;
  children: ReactNode;
}) {
  return (
    <div style={rootStyle}>
      <div style={cardStyle}>
        <div style={topBadgeStyle}>{badge}</div>
        {children}
      </div>
    </div>
  );
}

function OutboundSlide({ deal }: { deal: Deal }) {
  const priceStyle = splitPrice(deal.priceMad);

  return (
    <Base badge="Prix repéré récemment">
      <LineTitle>Vol</LineTitle>
      <RouteRow from={deal.fromAirport} to={deal.toAirport} />
      <Separator />
      <div style={{ display: 'flex', fontSize: 34, marginTop: 30 }}>
        Aller-retour à partir de
      </div>
      <div
        style={{
          alignItems: 'center',
          background: '#f1faf4',
          border: `2px dashed ${colors.green}`,
          borderRadius: 18,
          display: 'flex',
          height: 226,
          justifyContent: 'center',
          marginTop: 24,
          width: 780,
        }}
      >
        <span
          style={{
            color: colors.greenText,
            fontSize: priceStyle.amountFontSize,
            fontWeight: 900,
            letterSpacing: '-2px',
            lineHeight: 1,
          }}
        >
          {formatPrice(deal.priceMad)}
        </span>
        <span
          style={{
            color: colors.greenText,
            fontSize: priceStyle.unitFontSize,
            fontWeight: 900,
            letterSpacing: '1px',
            marginLeft: 34,
            marginTop: 26,
          }}
        >
          DHS
        </span>
      </div>
      <Separator />
      <div
        style={{
          display: 'flex',
          fontSize: 56,
          fontWeight: 900,
          marginTop: 46,
        }}
      >
        {deal.toCity}
      </div>
      <div style={{ display: 'flex', fontSize: 34, marginTop: 34 }}>
        {formatDate(deal.departureDate)}
      </div>
      <div
        style={{
          background: colors.line,
          display: 'flex',
          height: 1,
          marginTop: 64,
          width: 812,
        }}
      />
      <div style={{ display: 'flex', marginTop: 30 }}>
        <Pill style={getVisaStyle(deal.visaType)}>
          {getVisaLabel(deal.visaType)}
        </Pill>
      </div>
    </Base>
  );
}

function ReturnSlide({ deal }: { deal: Deal }) {
  return (
    <Base badge="Retour inclus">
      <LineTitle>Vol retour</LineTitle>
      <RouteRow from={deal.toAirport} to={deal.fromAirport} />
      <Separator />
      <div
        style={{
          alignItems: 'center',
          background: '#f1faf4',
          border: `2px solid ${colors.green}`,
          borderRadius: 26,
          color: colors.green,
          display: 'flex',
          fontSize: 44,
          fontWeight: 900,
          height: 172,
          justifyContent: 'center',
          marginTop: 54,
          width: 740,
        }}
      >
        Retour inclus dans l’offre
      </div>
      <Separator />
      <div
        style={{
          display: 'flex',
          fontSize: 56,
          fontWeight: 900,
          marginTop: 46,
        }}
      >
        {deal.fromCity}
      </div>
      <div style={{ display: 'flex', fontSize: 34, marginTop: 34 }}>
        {formatDate(deal.returnDate)}
      </div>
      <div style={{ display: 'flex', marginTop: 64 }}>
        <Pill style={getVisaStyle(deal.visaType)}>
          {getVisaLabel(deal.visaType)}
        </Pill>
      </div>
      {deal.airline && (
        <div
          style={{
            alignItems: 'center',
            background: colors.beige,
            borderRadius: 999,
            display: 'flex',
            fontSize: 30,
            fontWeight: 700,
            height: 64,
            justifyContent: 'center',
            marginTop: 22,
            minWidth: 350,
            padding: '0 34px',
          }}
        >
          {deal.airline}
        </div>
      )}
    </Base>
  );
}

function CtaSlide({ deal }: { deal: Deal }) {
  return (
    <Base badge="Offre à vérifier">
      <div
        style={{
          display: 'flex',
          fontSize: 58,
          fontWeight: 900,
          marginTop: 104,
        }}
      >
        Offre complète sur
      </div>
      <div
        style={{
          color: colors.green,
          display: 'flex',
          fontSize: 46,
          fontWeight: 900,
          marginTop: 18,
        }}
      >
        Men Matar L Matar
      </div>
      <div
        style={{
          background: colors.card,
          border: `2px solid ${colors.line}`,
          borderRadius: 30,
          display: 'flex',
          flexDirection: 'column',
          height: 450,
          marginTop: 76,
          padding: '50px 50px',
          width: 730,
        }}
      >
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 900 }}>
          {deal.fromCity} → {deal.toCity}
        </div>
        <div style={{ display: 'flex', marginTop: 30 }}>
          <Pill style={getVisaStyle(deal.visaType)}>
            {getVisaLabel(deal.visaType)}
          </Pill>
        </div>
        <div
          style={{
            color: colors.green,
            display: 'flex',
            fontSize: 64,
            fontWeight: 900,
            justifyContent: 'center',
            letterSpacing: '-1px',
            marginTop: 34,
          }}
        >
          {formatPrice(deal.priceMad)} DHS
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 34,
          fontWeight: 900,
          marginTop: 76,
        }}
      >
        Bons plans voyage depuis le Maroc
      </div>
      <div
        style={{
          color: colors.muted,
          display: 'flex',
          fontSize: 34,
          marginTop: 26,
        }}
      >
        Vols • Visas • IA voyage
      </div>
    </Base>
  );
}

export function getInstagramSlideElement(
  deal: Deal,
  slide: InstagramSlide,
) {
  if (slide === 'return') {
    return <ReturnSlide deal={deal} />;
  }

  if (slide === 'cta') {
    return <CtaSlide deal={deal} />;
  }

  return <OutboundSlide deal={deal} />;
}

export function getInstagramSlideFilename(deal: Deal, slide: InstagramSlide) {
  const base = `${deal.fromAirport}-${deal.toAirport}-${deal.priceMad}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${base}-${slide}.png`;
}
