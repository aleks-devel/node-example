import { Injectable } from "@nestjs/common";
import {
  InjectSortedCustomRepo,
  SortedRepository,
} from "@server/db/sorted-repository.service";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Not,
  SelectQueryBuilder,
} from "typeorm";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { getNgrams } from "@server/common/utils/getNgrams";
import { SocialProductModel } from "@server/main-site/socials/models/social-product.model";
import { SocialNetworkModel } from "@server/main-site/socials/models/social-network.model";
import {
  Filter,
  RelationFilter,
  SelectFilter,
} from "@server/common/utils/typeorm-filter.utils";
import { mergeRelations } from "@server/db/merge-relations.util";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { SocialProductsArgs } from "@server/main-site/socials/models/social-products.args";

@Injectable()
export class SocialsService {
  constructor(
    // @InjectSortedCustomRepo(SocialNetwork)
    // private socialNetworkRepo: SortedRepository<SocialNetwork>,
    // @InjectSortedCustomRepo(SubProduct)
    // private subRepo: SortedRepository<SubProduct>,
    // @InjectSortedCustomRepo(ReactionKit)
    // private kitRepo: SortedRepository<ReactionKit>,
    // @InjectSortedCustomRepo(DiscountMatrix)
    // private discountRepo: ExtendedRepositoryService<DiscountMatrix>,
    // @InjectSortedCustomRepo(SocialProduct)
    // private socialProductRepo: SortedRepository<SocialProduct>,
    private dataSet: DataSource,
  ) {}

  private searchInQuery(
    query: SelectQueryBuilder<any>, // nda
    search: string,
    filter: any,
  ) {
    // nda
  }

  private getProductSalesCnt(product: any) {
    // nda
  }

  private getSocialSalesCnt(social: any) {
    // nda
  }

  private async getProducts(
    filter: Filter<SocialProductModel>,
    args: {
      showPackage: boolean;
      orderIndex: boolean;
      ids?: number[];
      socialIds?: number[];
      search?: string;
    },
  ) {
    // nda
  }

  async getSocials(
    filter: Filter<SocialNetworkModel>,
    showPackage: boolean | undefined,
    limit?: number,
    findArgs?: FindOptionsWhere<any>,
  ) {
    // nda
  }

  async getSocial(
    id: number | undefined,
    url: string | undefined,
    filter: Filter<SocialNetworkModel>,
    showPackage: boolean | undefined,
  ) {
    // nda
  }

  async getSocialsProducts(
    ids: number[] | undefined,
    filter: Filter<SocialProductModel>,
    args: SocialProductsArgs,
  ) {
    // nda
  }
}
