import { CoBuyingPageingRes, PageingQueryDto } from "@cobuying/dto";
/**
 * DAO class는 어떤 DB를 사용하든지 아래 인터페이스만 구현하면 된다.
 * Service 컴포넌트는 이 인터페이스만 의존하면 DB 벤더를 의존하지 않아도 된다.
 */
export interface DBAdapterQueryInterface {
  queryCoBuyingList(query: PageingQueryDto): Promise<CoBuyingPageingRes>;
  
}