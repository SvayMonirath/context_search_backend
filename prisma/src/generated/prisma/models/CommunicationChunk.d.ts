import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model CommunicationChunk
 *
 */
export type CommunicationChunkModel = runtime.Types.Result.DefaultSelection<Prisma.$CommunicationChunkPayload>;
export type AggregateCommunicationChunk = {
    _count: CommunicationChunkCountAggregateOutputType | null;
    _avg: CommunicationChunkAvgAggregateOutputType | null;
    _sum: CommunicationChunkSumAggregateOutputType | null;
    _min: CommunicationChunkMinAggregateOutputType | null;
    _max: CommunicationChunkMaxAggregateOutputType | null;
};
export type CommunicationChunkAvgAggregateOutputType = {
    chunkIndex: number | null;
};
export type CommunicationChunkSumAggregateOutputType = {
    chunkIndex: number | null;
};
export type CommunicationChunkMinAggregateOutputType = {
    id: string | null;
    communicationID: string | null;
    chunkIndex: number | null;
    content: string | null;
    created_at: Date | null;
};
export type CommunicationChunkMaxAggregateOutputType = {
    id: string | null;
    communicationID: string | null;
    chunkIndex: number | null;
    content: string | null;
    created_at: Date | null;
};
export type CommunicationChunkCountAggregateOutputType = {
    id: number;
    communicationID: number;
    chunkIndex: number;
    content: number;
    created_at: number;
    _all: number;
};
export type CommunicationChunkAvgAggregateInputType = {
    chunkIndex?: true;
};
export type CommunicationChunkSumAggregateInputType = {
    chunkIndex?: true;
};
export type CommunicationChunkMinAggregateInputType = {
    id?: true;
    communicationID?: true;
    chunkIndex?: true;
    content?: true;
    created_at?: true;
};
export type CommunicationChunkMaxAggregateInputType = {
    id?: true;
    communicationID?: true;
    chunkIndex?: true;
    content?: true;
    created_at?: true;
};
export type CommunicationChunkCountAggregateInputType = {
    id?: true;
    communicationID?: true;
    chunkIndex?: true;
    content?: true;
    created_at?: true;
    _all?: true;
};
export type CommunicationChunkAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CommunicationChunk to aggregate.
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunicationChunks to fetch.
     */
    orderBy?: Prisma.CommunicationChunkOrderByWithRelationInput | Prisma.CommunicationChunkOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CommunicationChunkWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunicationChunks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunicationChunks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CommunicationChunks
    **/
    _count?: true | CommunicationChunkCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: CommunicationChunkAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: CommunicationChunkSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CommunicationChunkMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CommunicationChunkMaxAggregateInputType;
};
export type GetCommunicationChunkAggregateType<T extends CommunicationChunkAggregateArgs> = {
    [P in keyof T & keyof AggregateCommunicationChunk]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCommunicationChunk[P]> : Prisma.GetScalarType<T[P], AggregateCommunicationChunk[P]>;
};
export type CommunicationChunkGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CommunicationChunkWhereInput;
    orderBy?: Prisma.CommunicationChunkOrderByWithAggregationInput | Prisma.CommunicationChunkOrderByWithAggregationInput[];
    by: Prisma.CommunicationChunkScalarFieldEnum[] | Prisma.CommunicationChunkScalarFieldEnum;
    having?: Prisma.CommunicationChunkScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CommunicationChunkCountAggregateInputType | true;
    _avg?: CommunicationChunkAvgAggregateInputType;
    _sum?: CommunicationChunkSumAggregateInputType;
    _min?: CommunicationChunkMinAggregateInputType;
    _max?: CommunicationChunkMaxAggregateInputType;
};
export type CommunicationChunkGroupByOutputType = {
    id: string;
    communicationID: string;
    chunkIndex: number;
    content: string;
    created_at: Date;
    _count: CommunicationChunkCountAggregateOutputType | null;
    _avg: CommunicationChunkAvgAggregateOutputType | null;
    _sum: CommunicationChunkSumAggregateOutputType | null;
    _min: CommunicationChunkMinAggregateOutputType | null;
    _max: CommunicationChunkMaxAggregateOutputType | null;
};
export type GetCommunicationChunkGroupByPayload<T extends CommunicationChunkGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CommunicationChunkGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CommunicationChunkGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CommunicationChunkGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CommunicationChunkGroupByOutputType[P]>;
}>>;
export type CommunicationChunkWhereInput = {
    AND?: Prisma.CommunicationChunkWhereInput | Prisma.CommunicationChunkWhereInput[];
    OR?: Prisma.CommunicationChunkWhereInput[];
    NOT?: Prisma.CommunicationChunkWhereInput | Prisma.CommunicationChunkWhereInput[];
    id?: Prisma.StringFilter<"CommunicationChunk"> | string;
    communicationID?: Prisma.StringFilter<"CommunicationChunk"> | string;
    chunkIndex?: Prisma.IntFilter<"CommunicationChunk"> | number;
    content?: Prisma.StringFilter<"CommunicationChunk"> | string;
    created_at?: Prisma.DateTimeFilter<"CommunicationChunk"> | Date | string;
    communication?: Prisma.XOR<Prisma.CommunicationScalarRelationFilter, Prisma.CommunicationWhereInput>;
    embedding?: Prisma.XOR<Prisma.EmbeddingNullableScalarRelationFilter, Prisma.EmbeddingWhereInput> | null;
};
export type CommunicationChunkOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    communicationID?: Prisma.SortOrder;
    chunkIndex?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    created_at?: Prisma.SortOrder;
    communication?: Prisma.CommunicationOrderByWithRelationInput;
    embedding?: Prisma.EmbeddingOrderByWithRelationInput;
};
export type CommunicationChunkWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CommunicationChunkWhereInput | Prisma.CommunicationChunkWhereInput[];
    OR?: Prisma.CommunicationChunkWhereInput[];
    NOT?: Prisma.CommunicationChunkWhereInput | Prisma.CommunicationChunkWhereInput[];
    communicationID?: Prisma.StringFilter<"CommunicationChunk"> | string;
    chunkIndex?: Prisma.IntFilter<"CommunicationChunk"> | number;
    content?: Prisma.StringFilter<"CommunicationChunk"> | string;
    created_at?: Prisma.DateTimeFilter<"CommunicationChunk"> | Date | string;
    communication?: Prisma.XOR<Prisma.CommunicationScalarRelationFilter, Prisma.CommunicationWhereInput>;
    embedding?: Prisma.XOR<Prisma.EmbeddingNullableScalarRelationFilter, Prisma.EmbeddingWhereInput> | null;
}, "id">;
export type CommunicationChunkOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    communicationID?: Prisma.SortOrder;
    chunkIndex?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    created_at?: Prisma.SortOrder;
    _count?: Prisma.CommunicationChunkCountOrderByAggregateInput;
    _avg?: Prisma.CommunicationChunkAvgOrderByAggregateInput;
    _max?: Prisma.CommunicationChunkMaxOrderByAggregateInput;
    _min?: Prisma.CommunicationChunkMinOrderByAggregateInput;
    _sum?: Prisma.CommunicationChunkSumOrderByAggregateInput;
};
export type CommunicationChunkScalarWhereWithAggregatesInput = {
    AND?: Prisma.CommunicationChunkScalarWhereWithAggregatesInput | Prisma.CommunicationChunkScalarWhereWithAggregatesInput[];
    OR?: Prisma.CommunicationChunkScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CommunicationChunkScalarWhereWithAggregatesInput | Prisma.CommunicationChunkScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"CommunicationChunk"> | string;
    communicationID?: Prisma.StringWithAggregatesFilter<"CommunicationChunk"> | string;
    chunkIndex?: Prisma.IntWithAggregatesFilter<"CommunicationChunk"> | number;
    content?: Prisma.StringWithAggregatesFilter<"CommunicationChunk"> | string;
    created_at?: Prisma.DateTimeWithAggregatesFilter<"CommunicationChunk"> | Date | string;
};
export type CommunicationChunkCreateInput = {
    id?: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
    communication: Prisma.CommunicationCreateNestedOneWithoutChunksInput;
    embedding?: Prisma.EmbeddingCreateNestedOneWithoutChunkInput;
};
export type CommunicationChunkUncheckedCreateInput = {
    id?: string;
    communicationID: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
    embedding?: Prisma.EmbeddingUncheckedCreateNestedOneWithoutChunkInput;
};
export type CommunicationChunkUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    communication?: Prisma.CommunicationUpdateOneRequiredWithoutChunksNestedInput;
    embedding?: Prisma.EmbeddingUpdateOneWithoutChunkNestedInput;
};
export type CommunicationChunkUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    communicationID?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    embedding?: Prisma.EmbeddingUncheckedUpdateOneWithoutChunkNestedInput;
};
export type CommunicationChunkCreateManyInput = {
    id?: string;
    communicationID: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
};
export type CommunicationChunkUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunicationChunkUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    communicationID?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunicationChunkListRelationFilter = {
    every?: Prisma.CommunicationChunkWhereInput;
    some?: Prisma.CommunicationChunkWhereInput;
    none?: Prisma.CommunicationChunkWhereInput;
};
export type CommunicationChunkOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CommunicationChunkCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    communicationID?: Prisma.SortOrder;
    chunkIndex?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    created_at?: Prisma.SortOrder;
};
export type CommunicationChunkAvgOrderByAggregateInput = {
    chunkIndex?: Prisma.SortOrder;
};
export type CommunicationChunkMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    communicationID?: Prisma.SortOrder;
    chunkIndex?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    created_at?: Prisma.SortOrder;
};
export type CommunicationChunkMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    communicationID?: Prisma.SortOrder;
    chunkIndex?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    created_at?: Prisma.SortOrder;
};
export type CommunicationChunkSumOrderByAggregateInput = {
    chunkIndex?: Prisma.SortOrder;
};
export type CommunicationChunkScalarRelationFilter = {
    is?: Prisma.CommunicationChunkWhereInput;
    isNot?: Prisma.CommunicationChunkWhereInput;
};
export type CommunicationChunkCreateNestedManyWithoutCommunicationInput = {
    create?: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput> | Prisma.CommunicationChunkCreateWithoutCommunicationInput[] | Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput[];
    connectOrCreate?: Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput | Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput[];
    createMany?: Prisma.CommunicationChunkCreateManyCommunicationInputEnvelope;
    connect?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
};
export type CommunicationChunkUncheckedCreateNestedManyWithoutCommunicationInput = {
    create?: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput> | Prisma.CommunicationChunkCreateWithoutCommunicationInput[] | Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput[];
    connectOrCreate?: Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput | Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput[];
    createMany?: Prisma.CommunicationChunkCreateManyCommunicationInputEnvelope;
    connect?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
};
export type CommunicationChunkUpdateManyWithoutCommunicationNestedInput = {
    create?: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput> | Prisma.CommunicationChunkCreateWithoutCommunicationInput[] | Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput[];
    connectOrCreate?: Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput | Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput[];
    upsert?: Prisma.CommunicationChunkUpsertWithWhereUniqueWithoutCommunicationInput | Prisma.CommunicationChunkUpsertWithWhereUniqueWithoutCommunicationInput[];
    createMany?: Prisma.CommunicationChunkCreateManyCommunicationInputEnvelope;
    set?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    disconnect?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    delete?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    connect?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    update?: Prisma.CommunicationChunkUpdateWithWhereUniqueWithoutCommunicationInput | Prisma.CommunicationChunkUpdateWithWhereUniqueWithoutCommunicationInput[];
    updateMany?: Prisma.CommunicationChunkUpdateManyWithWhereWithoutCommunicationInput | Prisma.CommunicationChunkUpdateManyWithWhereWithoutCommunicationInput[];
    deleteMany?: Prisma.CommunicationChunkScalarWhereInput | Prisma.CommunicationChunkScalarWhereInput[];
};
export type CommunicationChunkUncheckedUpdateManyWithoutCommunicationNestedInput = {
    create?: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput> | Prisma.CommunicationChunkCreateWithoutCommunicationInput[] | Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput[];
    connectOrCreate?: Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput | Prisma.CommunicationChunkCreateOrConnectWithoutCommunicationInput[];
    upsert?: Prisma.CommunicationChunkUpsertWithWhereUniqueWithoutCommunicationInput | Prisma.CommunicationChunkUpsertWithWhereUniqueWithoutCommunicationInput[];
    createMany?: Prisma.CommunicationChunkCreateManyCommunicationInputEnvelope;
    set?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    disconnect?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    delete?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    connect?: Prisma.CommunicationChunkWhereUniqueInput | Prisma.CommunicationChunkWhereUniqueInput[];
    update?: Prisma.CommunicationChunkUpdateWithWhereUniqueWithoutCommunicationInput | Prisma.CommunicationChunkUpdateWithWhereUniqueWithoutCommunicationInput[];
    updateMany?: Prisma.CommunicationChunkUpdateManyWithWhereWithoutCommunicationInput | Prisma.CommunicationChunkUpdateManyWithWhereWithoutCommunicationInput[];
    deleteMany?: Prisma.CommunicationChunkScalarWhereInput | Prisma.CommunicationChunkScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type CommunicationChunkUpdateOneRequiredWithoutEmbeddingNestedInput = {
    create?: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutEmbeddingInput, Prisma.CommunicationChunkUncheckedCreateWithoutEmbeddingInput>;
    connectOrCreate?: Prisma.CommunicationChunkCreateOrConnectWithoutEmbeddingInput;
    upsert?: Prisma.CommunicationChunkUpsertWithoutEmbeddingInput;
    connect?: Prisma.CommunicationChunkWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CommunicationChunkUpdateToOneWithWhereWithoutEmbeddingInput, Prisma.CommunicationChunkUpdateWithoutEmbeddingInput>, Prisma.CommunicationChunkUncheckedUpdateWithoutEmbeddingInput>;
};
export type CommunicationChunkCreateWithoutCommunicationInput = {
    id?: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
    embedding?: Prisma.EmbeddingCreateNestedOneWithoutChunkInput;
};
export type CommunicationChunkUncheckedCreateWithoutCommunicationInput = {
    id?: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
    embedding?: Prisma.EmbeddingUncheckedCreateNestedOneWithoutChunkInput;
};
export type CommunicationChunkCreateOrConnectWithoutCommunicationInput = {
    where: Prisma.CommunicationChunkWhereUniqueInput;
    create: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput>;
};
export type CommunicationChunkCreateManyCommunicationInputEnvelope = {
    data: Prisma.CommunicationChunkCreateManyCommunicationInput | Prisma.CommunicationChunkCreateManyCommunicationInput[];
    skipDuplicates?: boolean;
};
export type CommunicationChunkUpsertWithWhereUniqueWithoutCommunicationInput = {
    where: Prisma.CommunicationChunkWhereUniqueInput;
    update: Prisma.XOR<Prisma.CommunicationChunkUpdateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedUpdateWithoutCommunicationInput>;
    create: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedCreateWithoutCommunicationInput>;
};
export type CommunicationChunkUpdateWithWhereUniqueWithoutCommunicationInput = {
    where: Prisma.CommunicationChunkWhereUniqueInput;
    data: Prisma.XOR<Prisma.CommunicationChunkUpdateWithoutCommunicationInput, Prisma.CommunicationChunkUncheckedUpdateWithoutCommunicationInput>;
};
export type CommunicationChunkUpdateManyWithWhereWithoutCommunicationInput = {
    where: Prisma.CommunicationChunkScalarWhereInput;
    data: Prisma.XOR<Prisma.CommunicationChunkUpdateManyMutationInput, Prisma.CommunicationChunkUncheckedUpdateManyWithoutCommunicationInput>;
};
export type CommunicationChunkScalarWhereInput = {
    AND?: Prisma.CommunicationChunkScalarWhereInput | Prisma.CommunicationChunkScalarWhereInput[];
    OR?: Prisma.CommunicationChunkScalarWhereInput[];
    NOT?: Prisma.CommunicationChunkScalarWhereInput | Prisma.CommunicationChunkScalarWhereInput[];
    id?: Prisma.StringFilter<"CommunicationChunk"> | string;
    communicationID?: Prisma.StringFilter<"CommunicationChunk"> | string;
    chunkIndex?: Prisma.IntFilter<"CommunicationChunk"> | number;
    content?: Prisma.StringFilter<"CommunicationChunk"> | string;
    created_at?: Prisma.DateTimeFilter<"CommunicationChunk"> | Date | string;
};
export type CommunicationChunkCreateWithoutEmbeddingInput = {
    id?: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
    communication: Prisma.CommunicationCreateNestedOneWithoutChunksInput;
};
export type CommunicationChunkUncheckedCreateWithoutEmbeddingInput = {
    id?: string;
    communicationID: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
};
export type CommunicationChunkCreateOrConnectWithoutEmbeddingInput = {
    where: Prisma.CommunicationChunkWhereUniqueInput;
    create: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutEmbeddingInput, Prisma.CommunicationChunkUncheckedCreateWithoutEmbeddingInput>;
};
export type CommunicationChunkUpsertWithoutEmbeddingInput = {
    update: Prisma.XOR<Prisma.CommunicationChunkUpdateWithoutEmbeddingInput, Prisma.CommunicationChunkUncheckedUpdateWithoutEmbeddingInput>;
    create: Prisma.XOR<Prisma.CommunicationChunkCreateWithoutEmbeddingInput, Prisma.CommunicationChunkUncheckedCreateWithoutEmbeddingInput>;
    where?: Prisma.CommunicationChunkWhereInput;
};
export type CommunicationChunkUpdateToOneWithWhereWithoutEmbeddingInput = {
    where?: Prisma.CommunicationChunkWhereInput;
    data: Prisma.XOR<Prisma.CommunicationChunkUpdateWithoutEmbeddingInput, Prisma.CommunicationChunkUncheckedUpdateWithoutEmbeddingInput>;
};
export type CommunicationChunkUpdateWithoutEmbeddingInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    communication?: Prisma.CommunicationUpdateOneRequiredWithoutChunksNestedInput;
};
export type CommunicationChunkUncheckedUpdateWithoutEmbeddingInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    communicationID?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunicationChunkCreateManyCommunicationInput = {
    id?: string;
    chunkIndex: number;
    content: string;
    created_at?: Date | string;
};
export type CommunicationChunkUpdateWithoutCommunicationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    embedding?: Prisma.EmbeddingUpdateOneWithoutChunkNestedInput;
};
export type CommunicationChunkUncheckedUpdateWithoutCommunicationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    embedding?: Prisma.EmbeddingUncheckedUpdateOneWithoutChunkNestedInput;
};
export type CommunicationChunkUncheckedUpdateManyWithoutCommunicationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    chunkIndex?: Prisma.IntFieldUpdateOperationsInput | number;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    created_at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunicationChunkSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    communicationID?: boolean;
    chunkIndex?: boolean;
    content?: boolean;
    created_at?: boolean;
    communication?: boolean | Prisma.CommunicationDefaultArgs<ExtArgs>;
    embedding?: boolean | Prisma.CommunicationChunk$embeddingArgs<ExtArgs>;
}, ExtArgs["result"]["communicationChunk"]>;
export type CommunicationChunkSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    communicationID?: boolean;
    chunkIndex?: boolean;
    content?: boolean;
    created_at?: boolean;
    communication?: boolean | Prisma.CommunicationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["communicationChunk"]>;
export type CommunicationChunkSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    communicationID?: boolean;
    chunkIndex?: boolean;
    content?: boolean;
    created_at?: boolean;
    communication?: boolean | Prisma.CommunicationDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["communicationChunk"]>;
export type CommunicationChunkSelectScalar = {
    id?: boolean;
    communicationID?: boolean;
    chunkIndex?: boolean;
    content?: boolean;
    created_at?: boolean;
};
export type CommunicationChunkOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "communicationID" | "chunkIndex" | "content" | "created_at", ExtArgs["result"]["communicationChunk"]>;
export type CommunicationChunkInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    communication?: boolean | Prisma.CommunicationDefaultArgs<ExtArgs>;
    embedding?: boolean | Prisma.CommunicationChunk$embeddingArgs<ExtArgs>;
};
export type CommunicationChunkIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    communication?: boolean | Prisma.CommunicationDefaultArgs<ExtArgs>;
};
export type CommunicationChunkIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    communication?: boolean | Prisma.CommunicationDefaultArgs<ExtArgs>;
};
export type $CommunicationChunkPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CommunicationChunk";
    objects: {
        communication: Prisma.$CommunicationPayload<ExtArgs>;
        embedding: Prisma.$EmbeddingPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        communicationID: string;
        chunkIndex: number;
        content: string;
        created_at: Date;
    }, ExtArgs["result"]["communicationChunk"]>;
    composites: {};
};
export type CommunicationChunkGetPayload<S extends boolean | null | undefined | CommunicationChunkDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload, S>;
export type CommunicationChunkCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CommunicationChunkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CommunicationChunkCountAggregateInputType | true;
};
export interface CommunicationChunkDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CommunicationChunk'];
        meta: {
            name: 'CommunicationChunk';
        };
    };
    /**
     * Find zero or one CommunicationChunk that matches the filter.
     * @param {CommunicationChunkFindUniqueArgs} args - Arguments to find a CommunicationChunk
     * @example
     * // Get one CommunicationChunk
     * const communicationChunk = await prisma.communicationChunk.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommunicationChunkFindUniqueArgs>(args: Prisma.SelectSubset<T, CommunicationChunkFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one CommunicationChunk that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CommunicationChunkFindUniqueOrThrowArgs} args - Arguments to find a CommunicationChunk
     * @example
     * // Get one CommunicationChunk
     * const communicationChunk = await prisma.communicationChunk.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommunicationChunkFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CommunicationChunkFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CommunicationChunk that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkFindFirstArgs} args - Arguments to find a CommunicationChunk
     * @example
     * // Get one CommunicationChunk
     * const communicationChunk = await prisma.communicationChunk.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommunicationChunkFindFirstArgs>(args?: Prisma.SelectSubset<T, CommunicationChunkFindFirstArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CommunicationChunk that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkFindFirstOrThrowArgs} args - Arguments to find a CommunicationChunk
     * @example
     * // Get one CommunicationChunk
     * const communicationChunk = await prisma.communicationChunk.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommunicationChunkFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CommunicationChunkFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more CommunicationChunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CommunicationChunks
     * const communicationChunks = await prisma.communicationChunk.findMany()
     *
     * // Get first 10 CommunicationChunks
     * const communicationChunks = await prisma.communicationChunk.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const communicationChunkWithIdOnly = await prisma.communicationChunk.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CommunicationChunkFindManyArgs>(args?: Prisma.SelectSubset<T, CommunicationChunkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a CommunicationChunk.
     * @param {CommunicationChunkCreateArgs} args - Arguments to create a CommunicationChunk.
     * @example
     * // Create one CommunicationChunk
     * const CommunicationChunk = await prisma.communicationChunk.create({
     *   data: {
     *     // ... data to create a CommunicationChunk
     *   }
     * })
     *
     */
    create<T extends CommunicationChunkCreateArgs>(args: Prisma.SelectSubset<T, CommunicationChunkCreateArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many CommunicationChunks.
     * @param {CommunicationChunkCreateManyArgs} args - Arguments to create many CommunicationChunks.
     * @example
     * // Create many CommunicationChunks
     * const communicationChunk = await prisma.communicationChunk.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CommunicationChunkCreateManyArgs>(args?: Prisma.SelectSubset<T, CommunicationChunkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many CommunicationChunks and returns the data saved in the database.
     * @param {CommunicationChunkCreateManyAndReturnArgs} args - Arguments to create many CommunicationChunks.
     * @example
     * // Create many CommunicationChunks
     * const communicationChunk = await prisma.communicationChunk.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CommunicationChunks and only return the `id`
     * const communicationChunkWithIdOnly = await prisma.communicationChunk.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CommunicationChunkCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CommunicationChunkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a CommunicationChunk.
     * @param {CommunicationChunkDeleteArgs} args - Arguments to delete one CommunicationChunk.
     * @example
     * // Delete one CommunicationChunk
     * const CommunicationChunk = await prisma.communicationChunk.delete({
     *   where: {
     *     // ... filter to delete one CommunicationChunk
     *   }
     * })
     *
     */
    delete<T extends CommunicationChunkDeleteArgs>(args: Prisma.SelectSubset<T, CommunicationChunkDeleteArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one CommunicationChunk.
     * @param {CommunicationChunkUpdateArgs} args - Arguments to update one CommunicationChunk.
     * @example
     * // Update one CommunicationChunk
     * const communicationChunk = await prisma.communicationChunk.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CommunicationChunkUpdateArgs>(args: Prisma.SelectSubset<T, CommunicationChunkUpdateArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more CommunicationChunks.
     * @param {CommunicationChunkDeleteManyArgs} args - Arguments to filter CommunicationChunks to delete.
     * @example
     * // Delete a few CommunicationChunks
     * const { count } = await prisma.communicationChunk.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CommunicationChunkDeleteManyArgs>(args?: Prisma.SelectSubset<T, CommunicationChunkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CommunicationChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CommunicationChunks
     * const communicationChunk = await prisma.communicationChunk.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CommunicationChunkUpdateManyArgs>(args: Prisma.SelectSubset<T, CommunicationChunkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CommunicationChunks and returns the data updated in the database.
     * @param {CommunicationChunkUpdateManyAndReturnArgs} args - Arguments to update many CommunicationChunks.
     * @example
     * // Update many CommunicationChunks
     * const communicationChunk = await prisma.communicationChunk.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CommunicationChunks and only return the `id`
     * const communicationChunkWithIdOnly = await prisma.communicationChunk.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends CommunicationChunkUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CommunicationChunkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one CommunicationChunk.
     * @param {CommunicationChunkUpsertArgs} args - Arguments to update or create a CommunicationChunk.
     * @example
     * // Update or create a CommunicationChunk
     * const communicationChunk = await prisma.communicationChunk.upsert({
     *   create: {
     *     // ... data to create a CommunicationChunk
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CommunicationChunk we want to update
     *   }
     * })
     */
    upsert<T extends CommunicationChunkUpsertArgs>(args: Prisma.SelectSubset<T, CommunicationChunkUpsertArgs<ExtArgs>>): Prisma.Prisma__CommunicationChunkClient<runtime.Types.Result.GetResult<Prisma.$CommunicationChunkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of CommunicationChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkCountArgs} args - Arguments to filter CommunicationChunks to count.
     * @example
     * // Count the number of CommunicationChunks
     * const count = await prisma.communicationChunk.count({
     *   where: {
     *     // ... the filter for the CommunicationChunks we want to count
     *   }
     * })
    **/
    count<T extends CommunicationChunkCountArgs>(args?: Prisma.Subset<T, CommunicationChunkCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CommunicationChunkCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a CommunicationChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommunicationChunkAggregateArgs>(args: Prisma.Subset<T, CommunicationChunkAggregateArgs>): Prisma.PrismaPromise<GetCommunicationChunkAggregateType<T>>;
    /**
     * Group by CommunicationChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunicationChunkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends CommunicationChunkGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CommunicationChunkGroupByArgs['orderBy'];
    } : {
        orderBy?: CommunicationChunkGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CommunicationChunkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommunicationChunkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CommunicationChunk model
     */
    readonly fields: CommunicationChunkFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for CommunicationChunk.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CommunicationChunkClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    communication<T extends Prisma.CommunicationDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CommunicationDefaultArgs<ExtArgs>>): Prisma.Prisma__CommunicationClient<runtime.Types.Result.GetResult<Prisma.$CommunicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    embedding<T extends Prisma.CommunicationChunk$embeddingArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CommunicationChunk$embeddingArgs<ExtArgs>>): Prisma.Prisma__EmbeddingClient<runtime.Types.Result.GetResult<Prisma.$EmbeddingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the CommunicationChunk model
 */
export interface CommunicationChunkFieldRefs {
    readonly id: Prisma.FieldRef<"CommunicationChunk", 'String'>;
    readonly communicationID: Prisma.FieldRef<"CommunicationChunk", 'String'>;
    readonly chunkIndex: Prisma.FieldRef<"CommunicationChunk", 'Int'>;
    readonly content: Prisma.FieldRef<"CommunicationChunk", 'String'>;
    readonly created_at: Prisma.FieldRef<"CommunicationChunk", 'DateTime'>;
}
/**
 * CommunicationChunk findUnique
 */
export type CommunicationChunkFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * Filter, which CommunicationChunk to fetch.
     */
    where: Prisma.CommunicationChunkWhereUniqueInput;
};
/**
 * CommunicationChunk findUniqueOrThrow
 */
export type CommunicationChunkFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * Filter, which CommunicationChunk to fetch.
     */
    where: Prisma.CommunicationChunkWhereUniqueInput;
};
/**
 * CommunicationChunk findFirst
 */
export type CommunicationChunkFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * Filter, which CommunicationChunk to fetch.
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunicationChunks to fetch.
     */
    orderBy?: Prisma.CommunicationChunkOrderByWithRelationInput | Prisma.CommunicationChunkOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CommunicationChunks.
     */
    cursor?: Prisma.CommunicationChunkWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunicationChunks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunicationChunks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CommunicationChunks.
     */
    distinct?: Prisma.CommunicationChunkScalarFieldEnum | Prisma.CommunicationChunkScalarFieldEnum[];
};
/**
 * CommunicationChunk findFirstOrThrow
 */
export type CommunicationChunkFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * Filter, which CommunicationChunk to fetch.
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunicationChunks to fetch.
     */
    orderBy?: Prisma.CommunicationChunkOrderByWithRelationInput | Prisma.CommunicationChunkOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CommunicationChunks.
     */
    cursor?: Prisma.CommunicationChunkWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunicationChunks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunicationChunks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CommunicationChunks.
     */
    distinct?: Prisma.CommunicationChunkScalarFieldEnum | Prisma.CommunicationChunkScalarFieldEnum[];
};
/**
 * CommunicationChunk findMany
 */
export type CommunicationChunkFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * Filter, which CommunicationChunks to fetch.
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunicationChunks to fetch.
     */
    orderBy?: Prisma.CommunicationChunkOrderByWithRelationInput | Prisma.CommunicationChunkOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CommunicationChunks.
     */
    cursor?: Prisma.CommunicationChunkWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunicationChunks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunicationChunks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CommunicationChunks.
     */
    distinct?: Prisma.CommunicationChunkScalarFieldEnum | Prisma.CommunicationChunkScalarFieldEnum[];
};
/**
 * CommunicationChunk create
 */
export type CommunicationChunkCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * The data needed to create a CommunicationChunk.
     */
    data: Prisma.XOR<Prisma.CommunicationChunkCreateInput, Prisma.CommunicationChunkUncheckedCreateInput>;
};
/**
 * CommunicationChunk createMany
 */
export type CommunicationChunkCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many CommunicationChunks.
     */
    data: Prisma.CommunicationChunkCreateManyInput | Prisma.CommunicationChunkCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CommunicationChunk createManyAndReturn
 */
export type CommunicationChunkCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * The data used to create many CommunicationChunks.
     */
    data: Prisma.CommunicationChunkCreateManyInput | Prisma.CommunicationChunkCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * CommunicationChunk update
 */
export type CommunicationChunkUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * The data needed to update a CommunicationChunk.
     */
    data: Prisma.XOR<Prisma.CommunicationChunkUpdateInput, Prisma.CommunicationChunkUncheckedUpdateInput>;
    /**
     * Choose, which CommunicationChunk to update.
     */
    where: Prisma.CommunicationChunkWhereUniqueInput;
};
/**
 * CommunicationChunk updateMany
 */
export type CommunicationChunkUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update CommunicationChunks.
     */
    data: Prisma.XOR<Prisma.CommunicationChunkUpdateManyMutationInput, Prisma.CommunicationChunkUncheckedUpdateManyInput>;
    /**
     * Filter which CommunicationChunks to update
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * Limit how many CommunicationChunks to update.
     */
    limit?: number;
};
/**
 * CommunicationChunk updateManyAndReturn
 */
export type CommunicationChunkUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * The data used to update CommunicationChunks.
     */
    data: Prisma.XOR<Prisma.CommunicationChunkUpdateManyMutationInput, Prisma.CommunicationChunkUncheckedUpdateManyInput>;
    /**
     * Filter which CommunicationChunks to update
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * Limit how many CommunicationChunks to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * CommunicationChunk upsert
 */
export type CommunicationChunkUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * The filter to search for the CommunicationChunk to update in case it exists.
     */
    where: Prisma.CommunicationChunkWhereUniqueInput;
    /**
     * In case the CommunicationChunk found by the `where` argument doesn't exist, create a new CommunicationChunk with this data.
     */
    create: Prisma.XOR<Prisma.CommunicationChunkCreateInput, Prisma.CommunicationChunkUncheckedCreateInput>;
    /**
     * In case the CommunicationChunk was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CommunicationChunkUpdateInput, Prisma.CommunicationChunkUncheckedUpdateInput>;
};
/**
 * CommunicationChunk delete
 */
export type CommunicationChunkDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
    /**
     * Filter which CommunicationChunk to delete.
     */
    where: Prisma.CommunicationChunkWhereUniqueInput;
};
/**
 * CommunicationChunk deleteMany
 */
export type CommunicationChunkDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CommunicationChunks to delete
     */
    where?: Prisma.CommunicationChunkWhereInput;
    /**
     * Limit how many CommunicationChunks to delete.
     */
    limit?: number;
};
/**
 * CommunicationChunk.embedding
 */
export type CommunicationChunk$embeddingArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Embedding
     */
    select?: Prisma.EmbeddingSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Embedding
     */
    omit?: Prisma.EmbeddingOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmbeddingInclude<ExtArgs> | null;
    where?: Prisma.EmbeddingWhereInput;
};
/**
 * CommunicationChunk without action
 */
export type CommunicationChunkDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunicationChunk
     */
    select?: Prisma.CommunicationChunkSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunicationChunk
     */
    omit?: Prisma.CommunicationChunkOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunicationChunkInclude<ExtArgs> | null;
};
//# sourceMappingURL=CommunicationChunk.d.ts.map