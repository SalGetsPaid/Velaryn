const prismaConfig = {
  datasources: {
    db: {
      provider: 'sqlite',
      url: 'file:./dev.db',
    },
  },
};

export default prismaConfig;