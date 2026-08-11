const assert = require('node:assert/strict');
const path = require('node:path');
const { describe, test, before, after } = require('node:test');

const { profileHarness } = require('jsii-target-ruby/testing');

/**
 * What aws-cdk-lib is called in Ruby.
 *
 * These are questions about *this library*, not about the target: the target
 * takes whatever profile it is handed and has no opinion on whether `aws_s3`
 * should be `AWSCDK::S3`. So they are asked here, through the harness the
 * target publishes for exactly this.
 *
 * Needs an installed aws-cdk-lib to run:
 *   AWS_CDK_LIB=node_modules/aws-cdk-lib node --test test/
 */
const PROFILE = path.resolve(__dirname, '..', 'config', 'profile.json');
const ASSEMBLY = process.env.AWS_CDK_LIB;

describe('the aws-cdk-lib naming profile', () => {
  let h;
  before(() => {
    h = profileHarness({ profile: PROFILE, assemblies: ASSEMBLY ? [ASSEMBLY] : [] });
  });
  after(() => h?.dispose());

  test('names the root module', () => {
    assert.equal(h.modulePathFor('aws-cdk-lib'), 'AWSCDK');
  });

  test('applies AWS acronym casing to submodules', () => {
    // The decisions a generic derivation gets wrong: Ec2, Iam, Rds.
    assert.equal(h.modulePathFor('aws-cdk-lib.aws_ec2'), 'AWSCDK::EC2');
    assert.equal(h.modulePathFor('aws-cdk-lib.aws_iam'), 'AWSCDK::IAM');
    assert.equal(h.modulePathFor('aws-cdk-lib.aws_rds'), 'AWSCDK::RDS');
  });

  test('brands multi-word services the way AWS does', () => {
    assert.equal(h.modulePathFor('aws-cdk-lib.aws_stepfunctions'), 'AWSCDK::StepFunctions');
    assert.equal(h.modulePathFor('aws-cdk-lib.aws_opensearchservice'), 'AWSCDK::OpenSearchService');
    assert.equal(h.modulePathFor('aws-cdk-lib.aws_kinesisfirehose'), 'AWSCDK::KinesisFirehose');
  });

  test('resolves the conventional aliases that do not name their submodule', () => {
    // `firehose` is aws_kinesisfirehose, `sfn` is aws_stepfunctions. These are
    // how CDK's own examples are written, and getting them wrong puts a
    // constant that does not exist into every published example.
    if (!ASSEMBLY) return; // resolution by type name needs the assembly
    assert.match(
      h.render("new firehose.DeliveryStream(this, 'S');"),
      /AWSCDK::KinesisFirehose::DeliveryStream/,
    );
    assert.match(
      h.render("new sfn.StateMachine(this, 'M');"),
      /AWSCDK::StepFunctions::StateMachine/,
    );
  });

  test('every submodule of the installed aws-cdk-lib has a name', () => {
    // The drift check. Every release can add services, and an unnamed one
    // renders as a derived guess (`aws_xyz` -> `Xyz`) that becomes permanent
    // public API the moment it ships. Failing here means somebody has a
    // naming decision to make, which is the point.
    if (!ASSEMBLY) return;
    const unnamed = h.unnamedSubmodules();
    assert.deepEqual(
      unnamed,
      [],
      `${unnamed.length} unnamed submodule(s); add them to config/profile.json:\n  ${unnamed.join('\n  ')}`,
    );
  });
});
