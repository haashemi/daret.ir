import type { ComponentType } from "react";

import type { DoorSlug } from "@/lib/doors";

import { Barn } from "./barn";
import { Boss } from "./boss";
import { Bus } from "./bus";
import { Cardboard } from "./cardboard";
import { CatFlap } from "./cat-flap";
import { Chocolate } from "./chocolate";
import { Closet } from "./closet";
import { Container } from "./container";
import { Dutch } from "./dutch";
import { Elevator } from "./elevator";
import { Fridge } from "./fridge";
import { FrostedGlass } from "./frosted-glass";
import { Gaming } from "./gaming";
import { Heaven } from "./heaven";
import { Hell } from "./hell";
import { Hobbit } from "./hobbit";
import { Nested } from "./nested";
import { OperatingRoom } from "./operating-room";
import { Paranoid } from "./paranoid";
import { Persian } from "./persian";
import { PhoneBooth } from "./phone-booth";
import { Pixel } from "./pixel";
import { Pride } from "./pride";
import { Prison } from "./prison";
import { Restroom } from "./restroom";
import { Revolving } from "./revolving";
import { Saloon } from "./saloon";
import { Scifi } from "./scifi";
import { Security } from "./security";
import { Shoji } from "./shoji";
import { Shutter } from "./shutter";
import { Vault } from "./vault";
import { Walnut } from "./walnut";
import { WashingMachine } from "./washing-machine";
import { WhitePanel } from "./white-panel";

export const models: Record<DoorSlug, ComponentType> = {
  walnut: Walnut,
  "white-panel": WhitePanel,
  security: Security,
  prison: Prison,
  restroom: Restroom,
  "frosted-glass": FrostedGlass,
  barn: Barn,
  persian: Persian,
  vault: Vault,
  fridge: Fridge,
  elevator: Elevator,
  shoji: Shoji,
  hobbit: Hobbit,
  closet: Closet,
  container: Container,
  saloon: Saloon,
  dutch: Dutch,
  revolving: Revolving,
  scifi: Scifi,
  "phone-booth": PhoneBooth,
  pride: Pride,
  "cat-flap": CatFlap,
  shutter: Shutter,
  "washing-machine": WashingMachine,
  cardboard: Cardboard,
  paranoid: Paranoid,
  gaming: Gaming,
  "operating-room": OperatingRoom,
  bus: Bus,
  pixel: Pixel,
  chocolate: Chocolate,
  heaven: Heaven,
  hell: Hell,
  boss: Boss,
  nested: Nested,
};
