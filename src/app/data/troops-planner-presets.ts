import { TroopConfiguration } from '../models/troop-configuration.model';

export const troopConfigurationPresets: TroopConfiguration[] = [
  {
    id: 'balanced-army',
    name: 'Balanced Army',
    isPreset: true,
    unitAmounts: {
      swordsman: 200,
      slinger: 100,
      archer: 100,
      hoplite: 100,
      bireme: 20,
      light_ship: 20,
      transport_boat: 15,
    },
    modifiers: {
      bunks: false,
    },
  },
  {
    id: 'land-offense',
    name: 'Land Offense',
    isPreset: true,
    unitAmounts: {
      slinger: 400,
      horseman: 120,
      hoplite: 200,
      catapult: 20,
      transport_boat: 30,
    },
    modifiers: {
      bunks: false,
    },
  },
  {
    id: 'naval-defense',
    name: 'Naval Defense',
    isPreset: true,
    unitAmounts: {
      bireme: 120,
      fire_ship: 40,
      trireme: 40,
    },
    modifiers: {
      bunks: false,
    },
  },
];
