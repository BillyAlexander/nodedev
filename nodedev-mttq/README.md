# nodedev-mttq

## `agent/connect`

``` js
{
    agent: {
        uuid, // auto
        username, // def por config
        name, //def por config
        hotname, //obt del Sys Ope
        pid //obtener del proceso
    }
}
```

## `agent/disconnect`

```js
{
    agent: {
        uuid
    }
}
```

## `agent/message`
```js
{
    agent,
    metrics:[
        {
            type,
            value
        }
    ],
    timestamp
}
```
