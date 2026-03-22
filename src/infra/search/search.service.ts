import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Product } from '@prisma/client';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly INDEX_NAME = 'products';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.INDEX_NAME,
      });
      if (!indexExists) {
        // Elasticsearch JS client v9: mappings is a top-level key, NOT inside body
        await this.elasticsearchService.indices.create({
          index: this.INDEX_NAME,
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text' },
              description: { type: 'text' },
              price: { type: 'float' },
              type: { type: 'keyword' },
            },
          },
        });
        this.logger.log(`Created Elasticsearch index: ${this.INDEX_NAME}`);
      }
    } catch (error) {
      this.logger.error('Error initialising elasticsearch index', error);
    }
  }

  async indexProduct(product: Product) {
    try {
      await this.elasticsearchService.index({
        index: this.INDEX_NAME,
        id: product.id.toString(),
        document: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          type: product.type,
        },
      });
      await this.elasticsearchService.indices.refresh({
        index: this.INDEX_NAME,
      });
    } catch (error) {
      this.logger.error(`Error indexing product ${product.id}`, error);
    }
  }

  async updateProduct(product: Product) {
    try {
      await this.elasticsearchService.update({
        index: this.INDEX_NAME,
        id: product.id.toString(),
        doc: {
          name: product.name,
          description: product.description,
          price: product.price,
          type: product.type,
        },
      });
      await this.elasticsearchService.indices.refresh({
        index: this.INDEX_NAME,
      });
    } catch (error) {
      this.logger.error(`Error updating product ${product.id} in ES`, error);
    }
  }

  async removeProduct(id: number) {
    try {
      await this.elasticsearchService.delete({
        index: this.INDEX_NAME,
        id: id.toString(),
      });
      await this.elasticsearchService.indices.refresh({
        index: this.INDEX_NAME,
      });
    } catch (error) {
      this.logger.error(`Error removing product ${id} from ES`, error);
    }
  }

  async searchProducts(text: string): Promise<number[]> {
    try {
      // Elasticsearch JS client v9: query is a top-level key, NOT inside body
      const { hits } = await this.elasticsearchService.search<{ id: number }>({
        index: this.INDEX_NAME,
        query: {
          multi_match: {
            query: text,
            fields: ['name^3', 'description'],
            fuzziness: 'AUTO',
          },
        },
      });

      return hits.hits
        .map((hit) => Number(hit._id))
        .filter((id): id is number => Number.isFinite(id));
    } catch (error) {
      this.logger.error('Error searching products', error);
      return [];
    }
  }
}
