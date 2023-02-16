import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DataUploadedTable extends Construct {
  public readonly dynamoDataUploadedTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.dynamoDataUploadedTable = this.createDataUploadedTable();
  }

  private createDataUploadedTable(): ITable {
    const dataUploadedTable = new Table(this, 'data-uploaded', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      tableName: 'data-uploaded',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
    });
    return dataUploadedTable;
  }
}
