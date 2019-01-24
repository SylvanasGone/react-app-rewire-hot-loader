function rewireHotLoader(config, babelLoader) {
  if (!babelLoader) {
    console.log('babel-loader not found')
    return config
  }

  // Find a rule which contains eslint-loader
  const condition = u => typeof u === 'object' && u.loader && u.loader.includes('eslint-loader')
  const rule = config.module.rules.find(rule => rule.use && rule.use.some(condition))

  if (rule) {
    const use = rule.use.find(condition)

    if (use) {
      // Inject the option for eslint-loader
      use.options.emitWarning = true
    }
  }

  const options = babelLoader.options || babelLoader.query
  options.plugins = ['react-hot-loader/babel'].concat(options.plugins || [])

  return config
}

module.exports = rewireHotLoader
