import "server-only";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { OfferDocumentModel } from "@/domain/offers/offer-model";
import { siteConfig } from "@/lib/site";

const BRAND = {
  obsidian: "#0A0D0C",
  steel: "#606A66",
  porcelain: "#F3F4F0",
  veridian: "#00B884",
  veridianDark: "#007A59",
  hairline: "#DCDFD9",
  panel: "#F4F4F2",
} as const;

export type OfferDealer = {
  contactEmail: string;
  contactPhone: string;
  address: string;
};

export type OfferDocumentProps = {
  offer: OfferDocumentModel;
  dealer: OfferDealer;
  previewImage?: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 58,
    paddingHorizontal: 40,
    fontFamily: "Manrope",
    fontSize: 9.5,
    color: BRAND.obsidian,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: BRAND.obsidian,
    paddingBottom: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 22,
    height: 22,
    backgroundColor: BRAND.veridian,
    borderRadius: 2,
    marginRight: 8,
    paddingTop: 3,
  },
  brandMarkLetter: {
    fontFamily: "Barlow Condensed",
    fontWeight: 800,
    fontSize: 13,
    color: BRAND.obsidian,
    textAlign: "center",
  },
  brandName: {
    fontFamily: "Barlow Condensed",
    fontWeight: 800,
    fontSize: 19,
    letterSpacing: 1.1,
  },
  brandSuffix: {
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: 1.1,
    color: BRAND.veridianDark,
  },
  documentKind: {
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 1.6,
    color: BRAND.steel,
    textAlign: "right",
  },
  documentMeta: {
    fontSize: 8,
    color: BRAND.steel,
    textAlign: "right",
    marginTop: 3,
  },

  titleBlock: { marginTop: 14 },
  eyebrow: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.9,
    color: BRAND.veridianDark,
    textTransform: "uppercase",
  },
  modelName: {
    fontFamily: "Barlow Condensed",
    fontWeight: 800,
    fontSize: 34,
    letterSpacing: 0.4,
    marginTop: 3,
    textTransform: "uppercase",
  },

  preview: {
    marginTop: 10,
    backgroundColor: BRAND.panel,
    borderWidth: 1,
    borderColor: BRAND.hairline,
  },
  // A fixed band keeps the artwork from crowding the price table off the page.
  previewImage: { width: "100%", height: 230, objectFit: "cover" },

  sectionTitle: {
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
  },

  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.hairline,
    paddingVertical: 6,
  },
  lineLabel: { flexGrow: 1, flexShrink: 1, paddingRight: 16 },
  lineName: { fontSize: 10 },
  lineNameStrong: { fontSize: 10.5, fontWeight: 700 },
  lineCaption: { fontSize: 7.5, color: BRAND.steel, marginTop: 1.5 },
  linePrice: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "right",
    flexShrink: 0,
  },
  lineIncluded: {
    fontSize: 9,
    color: BRAND.veridianDark,
    textAlign: "right",
    flexShrink: 0,
  },

  groupHeading: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.1,
    color: BRAND.steel,
    textTransform: "uppercase",
    marginTop: 11,
    marginBottom: 1,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: BRAND.obsidian,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 14,
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: BRAND.porcelain,
    textTransform: "uppercase",
  },
  totalCaption: { fontSize: 7.5, color: "#9AA49F", marginTop: 2 },
  totalValue: {
    fontFamily: "Barlow Condensed",
    fontWeight: 800,
    fontSize: 27,
    color: BRAND.porcelain,
  },

  columns: { flexDirection: "row", marginTop: 12 },
  column: { flexGrow: 1, flexBasis: 0, paddingRight: 18 },
  columnLast: { flexGrow: 1, flexBasis: 0, paddingRight: 0 },
  step: {
    flexGrow: 1,
    flexBasis: 0,
    paddingRight: 14,
    borderTopWidth: 2,
    borderTopColor: BRAND.veridian,
    paddingTop: 7,
  },
  stepIndex: {
    fontFamily: "Barlow Condensed",
    fontWeight: 800,
    fontSize: 16,
    color: BRAND.veridianDark,
  },
  stepTitle: { fontSize: 9, fontWeight: 700, marginTop: 2 },
  stepText: { fontSize: 8, lineHeight: 1.45, color: BRAND.steel, marginTop: 3 },
  bullet: { flexDirection: "row", marginBottom: 3 },
  bulletDot: { color: BRAND.veridianDark, marginRight: 5 },
  bulletText: { flexGrow: 1, flexShrink: 1, fontSize: 8.5, lineHeight: 1.45 },
  dealerLine: { fontSize: 8.5, lineHeight: 1.5, color: BRAND.steel },
  dealerStrong: { fontSize: 8.5, fontWeight: 700, color: BRAND.obsidian },

  notice: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: BRAND.hairline,
    backgroundColor: BRAND.panel,
    padding: 10,
  },
  noticeWarning: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E4C97A",
    backgroundColor: "#FBF4E2",
    padding: 10,
  },
  noticeText: { fontSize: 7.5, lineHeight: 1.5, color: BRAND.steel },

  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 26,
    borderTopWidth: 1,
    borderTopColor: BRAND.hairline,
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: BRAND.steel },
});

function formatPrice(valueMinor: number, currency: string) {
  return `${new Intl.NumberFormat(siteConfig.locale, {
    maximumFractionDigits: 0,
  }).format(valueMinor / 100)} ${currency}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    dateStyle: "long",
    timeZone: "Europe/Bucharest",
  }).format(value);
}

function PriceLine({
  name,
  caption,
  priceMinor,
  currency,
  strong,
  signed = true,
}: {
  name: string;
  caption?: string;
  priceMinor: number;
  currency: string;
  strong?: boolean;
  /** Option deltas read as "+ 1.690 RON"; the base price is an absolute value. */
  signed?: boolean;
}) {
  return (
    <View style={styles.lineRow} wrap={false}>
      <View style={styles.lineLabel}>
        <Text style={strong ? styles.lineNameStrong : styles.lineName}>
          {name}
        </Text>
        {caption ? <Text style={styles.lineCaption}>{caption}</Text> : null}
      </View>
      {signed && priceMinor === 0 ? (
        <Text style={styles.lineIncluded}>Inclus</Text>
      ) : (
        <Text style={styles.linePrice}>
          {signed ? "+ " : ""}
          {formatPrice(priceMinor, currency)}
        </Text>
      )}
    </View>
  );
}

export function OfferDocument({
  offer,
  dealer,
  previewImage,
}: OfferDocumentProps) {
  const title = `Ofertă ${offer.modelName}${
    offer.reference ? ` · ${offer.reference}` : ""
  }`;

  return (
    <Document
      title={title}
      author={siteConfig.name}
      subject={`Configurație ${offer.modelName}`}
      creator={siteConfig.name}
      producer={siteConfig.name}
      language="ro-RO"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkLetter}>V</Text>
            </View>
            <Text style={styles.brandName}>
              VERIDIAN <Text style={styles.brandSuffix}>MOTO</Text>
            </Text>
          </View>
          <View>
            <Text style={styles.documentKind}>OFERTĂ CONFIGURAȚIE</Text>
            <Text style={styles.documentMeta}>
              {offer.reference
                ? `Referință ${offer.reference}`
                : "Configurație nesalvată"}
            </Text>
            <Text style={styles.documentMeta}>
              Emisă {formatDate(offer.issuedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>
            {[siteConfig.shortName, offer.category, offer.modelYear]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <Text style={styles.modelName}>{offer.modelName}</Text>
        </View>

        {previewImage ? (
          <View style={styles.preview}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- PDF primitive, not an <img> */}
            <Image style={styles.previewImage} src={previewImage} />
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Configurația ta</Text>

        <PriceLine
          name="Preț de bază"
          caption="Motocicleta în specificația standard, TVA inclus"
          priceMinor={offer.basePriceMinor}
          currency={offer.currency}
          signed={false}
          strong
        />

        {offer.groups.map((group) => (
          <View key={group.name}>
            <Text style={styles.groupHeading}>{group.name}</Text>
            {group.items.map((item, index) => (
              <PriceLine
                key={`${group.name}-${item.name}-${index}`}
                name={item.name}
                caption={
                  item.unavailable
                    ? "Alegere istorică — indisponibilă în catalogul curent"
                    : undefined
                }
                priceMinor={item.priceDeltaMinor}
                currency={offer.currency}
              />
            ))}
          </View>
        ))}

        <View style={styles.totalRow} wrap={false}>
          <View>
            <Text style={styles.totalLabel}>Total configurat</Text>
            <Text style={styles.totalCaption}>
              TVA inclus · opțiuni{" "}
              {formatPrice(offer.optionsTotalMinor, offer.currency)}
            </Text>
          </View>
          <Text style={styles.totalValue}>
            {formatPrice(offer.totalMinor, offer.currency)}
          </Text>
        </View>

        {offer.hasUnavailableSelections ? (
          <View style={styles.noticeWarning} wrap={false}>
            <Text style={styles.noticeText}>
              Configurația conține opțiuni care nu mai figurează în catalogul
              publicat. Le păstrăm aici pentru că prețul salvat rămâne valabil
              ca referință, dar disponibilitatea lor trebuie confirmată de
              consultant înainte de comandă.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Pașii următori</Text>
        <View style={styles.columns} wrap={false}>
          {[
            {
              title: "Trimiți oferta",
              text: offer.reference
                ? `Răspunde la acest document sau completează formularul de contact de pe veridian-moto.ro, menționând referința ${offer.reference}.`
                : "Salvează configurația pe veridian-moto.ro pentru a primi o referință, apoi trimite-ne acest document.",
            },
            {
              title: "Confirmăm disponibilitatea",
              text: "Un consultant verifică stocul, termenul de livrare și promoțiile în vigoare pentru configurația ta.",
            },
            {
              title: "Programăm proba",
              text: "Stabilim un test ride pe modelul configurat, în limita unităților disponibile în showroom.",
            },
          ].map((step, index) => (
            <View key={step.title} style={styles.step}>
              <Text style={styles.stepIndex}>0{index + 1}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.columns} wrap={false}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Dotări standard incluse</Text>
            {offer.standardEquipment.length ? (
              offer.standardEquipment.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.bulletText}>
                Lista completă a dotărilor standard este confirmată de
                consultant.
              </Text>
            )}
          </View>
          <View style={styles.columnLast}>
            <Text style={styles.sectionTitle}>Continuăm discuția</Text>
            <Text style={styles.dealerLine}>
              <Text style={styles.dealerStrong}>{siteConfig.name}</Text>
              {"\n"}
              {dealer.address}
              {"\n"}
              {dealer.contactPhone}
              {"\n"}
              {dealer.contactEmail}
            </Text>
            <Text style={[styles.dealerLine, { marginTop: 7 }]}>
              Ofertă valabilă până la{" "}
              <Text style={styles.dealerStrong}>
                {formatDate(offer.validUntil)}
              </Text>
              .
            </Text>
          </View>
        </View>

        <View style={styles.notice} wrap={false}>
          <Text style={styles.noticeText}>
            Documentul descrie o configurație posibilă și nu rezervă o unitate
            din stoc. Prețurile sunt exprimate în {offer.currency}, TVA inclus,
            și nu includ costuri de înmatriculare, transport sau servicii
            suplimentare. Disponibilitatea exactă, termenul de livrare și
            eventualele promoții în vigoare se confirmă de către un consultant
            VERIDIAN. Acest document nu constituie o ofertă fermă în sensul art.
            1188 Cod civil.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {siteConfig.name} · {siteConfig.tagline}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} din ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
