# aws-cdk-ruby

Ruby naming and distribution for **aws-cdk-lib**, built with
[jsii-target-ruby](https://github.com/omarqureshi/jsii-target-ruby).

The target is deliberately ignorant of AWS: it generates Ruby for any jsii
assembly and takes whatever naming profile it is handed. This repository is
that profile, plus everything downstream of it.

## What lives here

| | |
| --- | --- |
| `config/profile.json` | what aws-cdk-lib is called in Ruby — root module, submodule names, acronyms |
| `test/profile.test.js` | that those names are right, and that no release has added a submodule nobody has named |
| `.github/workflows/` | building and publishing the gems, and the API documentation |

## Why the naming is not derivable

Left to a generic derivation, `aws_ec2` becomes `Ec2` and `aws_iam` becomes
`Iam`. AWS brands them `EC2` and `IAM`, and a name is public API from the
moment it ships — so each is a decision recorded here rather than a guess made
at generation time.

The same applies to import aliases. CDK's examples say `firehose.X` for
`aws_kinesisfirehose` and `sfn.X` for `aws_stepfunctions`; the alias resembles
its submodule barely or not at all. Those resolve through the assembly's own
type names, which the target does, but only once the profile has said what the
submodules are called.

## Drift

`test/profile.test.js` fails when the installed aws-cdk-lib declares a
submodule the profile does not name. That failure is the feature: a new AWS
service has appeared and somebody has to decide what it is called in Ruby,
before it ships as a derived guess.

```sh
AWS_CDK_LIB=node_modules/aws-cdk-lib node --test test/*.test.js
```
