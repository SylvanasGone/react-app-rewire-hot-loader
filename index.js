const webpack = require('webpack')

const getLoader = (rules, matcher) => {
  let loader

  rules.some(rule => {
    return (loader = matcher(rule)
      ? rule
      : getLoader(
          rule.use || rule.oneOf || (Array.isArray(rule.loader) && rule.loader) || [],
          matcher
        ))
  })

  return loader
}

const getBabelLoader = rules => {
  return getLoader(rules, babelLoaderMatcher)
}

const injectBabelPlugin = (pluginName, config) => {
  const loader = getBabelLoader(config.module.rules)
  if (!loader) {
    console.log('babel-loader not found')
    return config
  }
  // Older versions of webpack have `plugins` on `loader.query` instead of `loader.options`.
  const options = loader.options || loader.query
  options.plugins = [pluginName].concat(options.plugins || [])
  return config
}


function rewireHotLoader(config, env) {
  if (env === 'production') {
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

  return injectBabelPlugin(['react-hot-loader/babel'], config)
}

module.exports = rewireHotLoader
