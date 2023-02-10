import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  ITable,
  StreamViewType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class FileUploadTable extends Construct {
  public readonly dynamoFileUploadTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.dynamoFileUploadTable = this.createFileUploadTable();
  }

  private createFileUploadTable(): ITable {
    const fileUploadTable = new Table(this, 'file-upload', {
      partitionKey: { name: 'id', type: AttributeType['STRING'] },
      //sortKey: { name: 'dueDate', type: AttributeType['STRING'] },
      tableName: 'file-uploads',
      billingMode: BillingMode['PAY_PER_REQUEST'],
      removalPolicy: RemovalPolicy['DESTROY'],
      stream: StreamViewType['NEW_AND_OLD_IMAGES'],
    });
    return fileUploadTable;
  }
}
