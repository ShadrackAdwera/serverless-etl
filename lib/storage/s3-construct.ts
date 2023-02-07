import { Bucket, BucketEncryption, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { randomUUID } from 'crypto';

export class EtlS3Construct extends Construct {
  public readonly bucket: IBucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.bucket = this.createS3Bucket();
  }

  private createS3Bucket(): Bucket {
    const bucket = new Bucket(this, `aws-etl-${randomUUID()}-bucket`, {
      encryption: BucketEncryption['S3_MANAGED'],
      publicReadAccess: false,
    });
    return bucket;
  }
}
