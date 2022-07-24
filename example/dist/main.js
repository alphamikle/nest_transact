"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const swagger_1 = require("@nestjs/swagger");
const core_1 = require("@nestjs/core");
const example_app_module_1 = require("./example-app.module");
const example_exception_filter_1 = require("./example.exception-filter");
const common_1 = require("@nestjs/common");
(0, config_1.aShowConfig)();
async function bootstrap() {
    const app = await core_1.NestFactory.create(example_app_module_1.ExampleAppModule);
    app.useGlobalFilters(new example_exception_filter_1.ExampleExceptionFilter());
    const options = new swagger_1.DocumentBuilder().setTitle('Nest Transact Example').setDescription('Showcase with transactions').setVersion('1.0').build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3000);
}
bootstrap().then(() => common_1.Logger.log(`App available at http://localhost:3000/api`, 'Main'));
//# sourceMappingURL=main.js.map