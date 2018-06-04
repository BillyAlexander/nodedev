# nodedev-db

## Usage

``` js
const setupDatabase = require('nodedev-db')

setupDatabase(config).then(db => {
    const { Agent, Metric } = db
}).catch(err => console.error(err))

```
