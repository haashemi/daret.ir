import type { ComponentType } from "react";

import type { DoorSlug } from "@/lib/doors";

import { Barn } from "./barn";
import { Closet } from "./closet";
import { Container } from "./container";
import { Elevator } from "./elevator";
import { Fridge } from "./fridge";
import { FrostedGlass } from "./frosted-glass";
import { Hobbit } from "./hobbit";
import { Persian } from "./persian";
import { Prison } from "./prison";
import { Restroom } from "./restroom";
import { Security } from "./security";
import { Shoji } from "./shoji";
import { Vault } from "./vault";
import { Walnut } from "./walnut";
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
};
