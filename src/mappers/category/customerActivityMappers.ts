import {
  createActivityRowMapper,
  formatNameProperty,
} from '@mappers/activity/genericActivityMappers';

const I18N_PREFIX = 'customers.detail';

export const customerActivityToRow = createActivityRowMapper({
  i18nPrefix: I18N_PREFIX,
  formatProperties: props => formatNameProperty(I18N_PREFIX, props),
});
