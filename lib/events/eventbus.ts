import { RemovalPolicy } from 'aws-cdk-lib';
import { EventBus, IEventBus, Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export const EVENT_SOURCE = 'com.serverless.etl.items';
export const EVENT_DETAILTYPE = 'EtlToSqlsItems';
export const EVENT_BUSNAME = 'EtlToSqlsEventBus';

interface IEventBusProps {
  target: IQueue;
  publisherFunction: IFunction;
}

export class EtlToSqsEventBus extends Construct {
  constructor(scope: Construct, id: string, props: IEventBusProps) {
    super(scope, id);
    // event bus
    const eventBus = this.generateEventBus();
    eventBus.grantPutEventsTo(props.publisherFunction);
    // rule
    const etlToSqsRule = this.generateRule(eventBus);
    etlToSqsRule.addTarget(new SqsQueue(props.target));
    etlToSqsRule.applyRemovalPolicy(RemovalPolicy['DESTROY']);
  }

  private generateEventBus(): IEventBus {
    const eventBus = new EventBus(this, 'EtlToSqlsEventBus', {
      eventBusName: EVENT_BUSNAME,
    });
    return eventBus;
  }

  private generateRule(bus: IEventBus): Rule {
    const rule = new Rule(this, 'EtlToSqlsRule', {
      eventBus: bus,
      enabled: true,
      description: 'Handle ETL events from etl microservice',
      eventPattern: {
        source: [EVENT_SOURCE],
        detailType: [EVENT_DETAILTYPE],
      },
      ruleName: 'EtlToSqlsRule',
    });
    return rule;
  }
}

/**
 * SAMPLE EVENT
 * [
  { "Source": "com.serverless.checkout.items", 
  "Detail": "{ "username": "abc", "item": "item 1" }", 
  "Resources": ["resource1","resource2"], 
  "DetailType": "CheckoutItems", 
  "EventBusName":"OrdersCheckoutEventBus" 
}
  ]
 * 
 */
