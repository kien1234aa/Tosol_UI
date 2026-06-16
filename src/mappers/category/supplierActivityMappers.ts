import {
  createActivityRowMapper,
  formatNameProperty,
} from '@mappers/activity/genericActivityMappers';

const I18N_PREFIX = 'suppliers.detail';

export const supplierActivityToRow = createActivityRowMapper({
  i18nPrefix: I18N_PREFIX,
  formatProperties: props => formatNameProperty(I18N_PREFIX, props),
});
