type EnhancerFactory = <T>(next: T) => T;

type ReactotronLike = {
  createEnhancer: () => EnhancerFactory;
};

const reactotron: ReactotronLike = {
  createEnhancer: () => next => next,
};

export default reactotron;
