module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": "airbnb",
  "plugins": [
    "react"
  ],
  "rules": {
    "class-methods-use-this": 1,
    "import/no-extraneous-dependencies": 0,
    "import/extensions": 0,
    "max-len": [2, { "code": 200 }],
    "no-console": [1, { "allow": ["warn", "error"] }],
    "no-underscore-dangle": 0,
    "react/forbid-prop-types": 0,
    "react/jsx-filename-extension": 0,
    "react/prefer-stateless-function": 0,
    "react/prop-types": [2, { "ignore": ["children"] }],
    "react/sort-comp": 0,
  },
  "settings": {
    "import/resolver": {
      "node": {
        "paths": ["src"]
      }
    }
  }
}
