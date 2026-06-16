import {
  createActivityRowMapper,
  formatOrderNumberProperty,
} from '@mappers/activity/genericActivityMappers';

export const inboundOrderActivityToRow = createActivityRowMapper({
  i18nPrefix: 'warehouseInbound.detail',
  formatProperties: props =>
    formatOrderNumberProperty('warehouseInbound.detail', props),
});

export const outboundOrderActivityToRow = createActivityRowMapper({
  i18nPrefix: 'warehouseOutbound.detail',
  formatProperties: props =>
    formatOrderNumberProperty('warehouseOutbound.detail', props),
});

export const packingOrderActivityToRow = createActivityRowMapper({
  i18nPrefix: 'warehousePacking.detail',
  formatProperties: props =>
    formatOrderNumberProperty('warehousePacking.detail', props),
});
