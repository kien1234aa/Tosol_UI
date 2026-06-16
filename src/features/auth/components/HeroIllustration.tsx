import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  HeroPanel,
  type HeroPanelVariant,
} from '@shared/components/ui/HeroPanel';
import {
  MiniStatCard,
  type MiniStatVariant,
} from '@shared/components/ui/MiniStatCard';

export type HeroIllustrationProps = {
  /** Theo chế độ giao diện đăng nhập (sáng / tối). */
  panelVariant?: HeroPanelVariant;
};

const HeroIllustration = ({
  panelVariant = 'light',
}: HeroIllustrationProps) => {
  const { width: winW, height: winH } = useWindowDimensions();
  const cardVariant: MiniStatVariant = panelVariant;
  /** Màn quá thấp / hẹp: bỏ thẻ góc để tránh chồng avatar và tràn ngang. */
  const showCornerCards = winH >= 520 && winW >= 300;

  const topLeft = useMemo(
    () =>
      showCornerCards ? (
        <MiniStatCard
          title="Profit"
          subtitle="Last Month"
          value="624k"
          delta="+8.24%"
          visual="sparkline"
          variant={cardVariant}
        />
      ) : undefined,
    [showCornerCards, cardVariant],
  );

  const bottomRight = useMemo(
    () =>
      showCornerCards ? (
        <MiniStatCard
          title="Order"
          subtitle="Last week"
          value="124k"
          delta="+12.6%"
          visual="bars"
          variant={cardVariant}
        />
      ) : undefined,
    [showCornerCards, cardVariant],
  );

  return (
    <HeroPanel
      variant={panelVariant}
      imageSource={require('../../../assets/images/avatar.png')}
      topLeft={topLeft}
      bottomRight={bottomRight}
    />
  );
};

export default HeroIllustration;
