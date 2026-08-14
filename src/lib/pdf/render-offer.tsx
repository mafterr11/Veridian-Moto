import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import {
  OfferDocument,
  type OfferDocumentProps,
} from "@/lib/pdf/offer-document";
import { registerOfferFonts } from "@/lib/pdf/fonts";

export async function renderOfferPdf(props: OfferDocumentProps) {
  registerOfferFonts();
  return renderToBuffer(<OfferDocument {...props} />);
}
