import type { Unit } from '../../models/unit.model';

export const slowTransportShipId = 'transport_boat';
export const fastTransportShipId = 'fast_transport_ship';
export const bunksCapacityBonusPerShip = 6;

export const isTransportShipUnitId = (unitId: string): boolean =>
  unitId === slowTransportShipId || unitId === fastTransportShipId;

export const getTransportShipCapacity = (
  units: readonly Unit[],
  unitId: string,
  bunksEnabled: boolean,
): number => {
  const baseCapacity = units.find((unit) => unit.id === unitId)?.transportCapacity ?? 0;

  return baseCapacity > 0 && bunksEnabled ? baseCapacity + bunksCapacityBonusPerShip : baseCapacity;
};

export const getRequiredTransportShipCount = (
  transportSpace: number,
  shipCapacity: number,
): number =>
  transportSpace > 0 && shipCapacity > 0 ? Math.ceil(transportSpace / shipCapacity) : 0;

export const calculateBunksBonus = (transportShipCount: number, bunksEnabled: boolean): number =>
  bunksEnabled ? transportShipCount * bunksCapacityBonusPerShip : 0;
