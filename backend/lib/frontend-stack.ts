import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, CachePolicy, CachedMethods, CfnDistribution, CfnOriginAccessControl, Distribution, PriceClass, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';



interface FrontendStackProps extends StackProps {
    paramProjectName: string;
    paramProjectEnv: string;
    paramProjectId: string;
    paramHostedZoneId: string;
    paramCertificateArn: string;
}



export class FrontendStack extends Stack {

    private bucket: Bucket;
    private distribution: Distribution;
    private certificate: ICertificate;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        this.certificate = Certificate.fromCertificateArn(this, 'SimiliSnapCertificate', props.paramCertificateArn);

        this.bucket = new Bucket(this, 'VueAppBucket', {
            bucketName: `${props.paramProjectName}-${props.paramProjectEnv}-${props.paramProjectId}-vueappbucket`,
            publicReadAccess: false,
            removalPolicy: RemovalPolicy.DESTROY,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        });


        const oac = new CfnOriginAccessControl(this, 'AOC', {
            originAccessControlConfig: {
                name: 'AOC',
                originAccessControlOriginType: 's3',
                signingBehavior: 'always',
                signingProtocol: 'sigv4',
            },
        })

        // Create a cloudfront distribution with an origin access control
        this.distribution = new Distribution(this, 'VueAppDistribution', {
            defaultBehavior: {
                origin: new S3Origin(this.bucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cachedMethods: CachedMethods.CACHE_GET_HEAD,
                cachePolicy: CachePolicy.CACHING_OPTIMIZED,
            },
            domainNames: ['similisnap.gharbidev.com'],
            certificate: this.certificate,
            enabled: true,
            defaultRootObject: 'index.html',
            priceClass: PriceClass.PRICE_CLASS_100,
            errorResponses: [{
                httpStatus: 404,
                responsePagePath: '/index.html',
                responseHttpStatus: 200,
                ttl: Duration.seconds(60)
            }]
        });

        this.distribution.node.addDependency(this.certificate);

        const cfnDistribution = this.distribution.node.defaultChild as CfnDistribution;

        cfnDistribution.addOverride('Properties.DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity', "");
        cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.getAtt('Id'));

        // Update bucket policy to grant CloudFront access
        this.bucket.addToResourcePolicy(new PolicyStatement({
            sid: 'AllowCloudFrontAccess',
            actions: ['s3:GetObject', 's3:ListBucket'],
            resources: [this.bucket.arnForObjects('*'), this.bucket.bucketArn],
            principals: [new ServicePrincipal('cloudfront.amazonaws.com')],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
                }
            }
        }));
    }
}
