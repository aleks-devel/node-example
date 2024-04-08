import { Module } from "@nestjs/common";
import { SocialsModule } from "@server/main-site/socials/socials.module";
import { StatusMatrixModule } from "@server/main-site/status-matrix/status-matrix.module";
import { NotificationsModule } from "@server/main-site/notifications/notifications.module";
import { EditorModule } from "@server/main-site/editor/editor.module";

@Module({
  imports: [SocialsModule, StatusMatrixModule, NotificationsModule, EditorModule],
})
export class MainSiteModule {}
