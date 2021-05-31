# form/b-input

This module provides a component to create a form input.

## Synopsis

* The component extends [[iInputText]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component supports tooltips.

* The component contains a `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers & Events

See the parent component and the component traits.

## Usage

The component has two base scenarios of usage:

1. A simple standalone input component.

```
< b-input :value = myValue | @onActionChange = console.log($event)

/// The component loads data from a provider
< b-input :dataProvide = 'MyProvider' | @onActionChange = console.log($event)
```

2. A component that tied with some form.

```
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname' | :value = fName
  < b-button :type = 'submit'
```

## Slots

The component supports a bunch of slots to provide:

1. `preIcon` and `icon` to inject icons around the value block.

```
< b-input
  < template #preIcon
    < img src = validate.svg

  < template #icon
    < img src = clear.svg
```

Also, these icons can be provided by props.

```
< b-input :icon = 'validate'
< b-input :preIcon = 'validate' | :iconComponent = 'b-custom-icon'

< b-input
  < template #icon = {icon}
    < img :src = icon
```

2. `progressIcon` to inject an icon that indicates loading, by default, is used [[bProgressIcon]].

```
< b-input
  < template #progressIcon
    < img src = spinner.svg
```

Also, this icon can be provided by a prop.

```
< b-input :progressIcon = 'bCustomLoader'
```

## API

## Validation

Because the component extends from [[iInput]], it supports validation API.``

```
< b-input :name = 'email' | :validators = ['required', 'email'] | @validationEnd = handler
```

### Built-in validators

The component provides a bunch of validators.

#### required

Checks that a component value must be filled.

```
< b-input :validators = ['required']
< b-input :validators = {required: {showMsg: false}}
```

#### number

Checks that a component value must be matched as a number.

```
< b-input :validators = ['number']
< b-input :validators = {number: {type: 'int', min: 10, max: 20}}
< b-input :validators = {number: {type: 'float', precision: 3, strictPrecision: true}}
```

#### date

Checks that a component value must be matched as a date.

```
< b-input :validators = ['date']
< b-input :validators = {date: {past: false}}
< b-input :validators = {date: {min: 'yesterday', max: 'tomorrow'}}
```

#### pattern

Checks that a component value must be matched to the provided pattern.

```
< b-input :validators = {pattern: {pattern: '^[\\d$]+'}}
< b-input :validators = {pattern: {min: 10, max: 20}}
```

#### email

Checks that a component value must be matched as an email string.

```
< b-input :validators = ['email']
< b-input :validators = {email: {showMsg: false}}
```

#### password

Checks that a component value must be matched as a password.

```
< b-input :id = 'old-password'

< b-input :name = 'password' | :validators = [['password', { &
  min: 12,
  max: 24,
  old: '#old-password',
  connected: '#repeat-password'
}]] .

< b-input :id = 'repeat-password'
```

## Styles

By default, the component provides a button to clear the input value.
You can configure it via CSS by using the `&__clear` selector.

```styl
&__clear
  size 20px
  background-image url("assets/my-icon.svg")
```