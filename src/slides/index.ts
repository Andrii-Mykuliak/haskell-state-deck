import type { SlideDef } from "../deck/steps";
import { agendaSlide, introSlides } from "./intro";
import { s1Slides } from "./s1-mutation";
import { s2Slides } from "./s2-transition";
import { s3Slides } from "./s3-sequence";
import { s3bSlides } from "./s3b-streams";
import { s4Slides } from "./s4-closures";
import { s5Slides, summarySlide } from "./s5-state";
import { outroSlide } from "./outro";

export const SLIDES: SlideDef[] = [
  ...introSlides,
  ...s1Slides,
  agendaSlide(1),
  ...s2Slides,
  agendaSlide(2),
  ...s3Slides,
  ...s3bSlides,
  agendaSlide(3),
  ...s4Slides,
  agendaSlide(4),
  ...s5Slides,
  summarySlide,
  outroSlide,
];
