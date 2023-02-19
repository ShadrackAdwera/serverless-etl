import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue, IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface QueueProps {
  consumer: IFunction;
}
export class EtlQueue extends Construct {
  public readonly etlQueue: IQueue;
  constructor(scope: Construct, id: string, props: QueueProps) {
    super(scope, id);
    this.etlQueue = new Queue(this, 'EtlQueue', {
      queueName: 'EtlQueue',
      visibilityTimeout: Duration.seconds(30),
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    props.consumer.addEventSource(
      new SqsEventSource(this.etlQueue, {
        batchSize: 1,
      })
    );
  }
}
