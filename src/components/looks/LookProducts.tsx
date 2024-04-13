import { Box, Button, Flex, IconButton, Image, Table, Tag, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProductLinks from "../products/ProductLinks";

type LookProductsProps = {
    products: any;
    onSave: (products: any) => void;
}
const LookProducts = ({ products, onSave }: LookProductsProps) => {
    const [editedProducts, setEditedProducts] = useState<any>(products);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        setEditedProducts(products);
    }, [products]);

    const handleAddNew = () => {}

    const handleRemove = (index: number) => {
        const newLinks = [...editedProducts];
        newLinks.splice(index, 1);
        setEditedProducts(newLinks);
    }

    const handleMoveUp = (index: number) => {
        if(index === 0) return;

        const newLinks = [...editedProducts];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index - 1, 0, removed);
        setEditedProducts(newLinks);
    }

    const handleMoveDown = (index: number) => {
        if(index === editedProducts.length - 1) return;

        const newLinks = [...editedProducts];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index + 1, 0, removed);
        setEditedProducts(newLinks);
    }

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    const handleSave = async () => {
        setIsProcessing(true);
        onSave(editedProducts);
        setIsProcessing(false);
    }

    return (
        <>
            <Box>
                {
                    editedProducts?.map((item: any, index: number) => <Product
                        key={index}
                        item={item}
                        index={index}
                        handleOpenImage={handleOpenImage}
                        handleRemove={handleRemove}
                        handleMoveUp={handleMoveUp}
                        handleMoveDown={handleMoveDown}
                    />
                )}
            </Box>

            {/* Actions */}
            <Flex alignItems='center' justifyContent='space-between' mt={4}>
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconPlus size={20} />}
                    onClick={handleAddNew}
                >Add</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    loadingText='Saving...'
                    onClick={handleSave}
                >Save</Button>
            </Flex>
        </>
    )
}

type ProductProps = {
    index: number,
    item: any,
    handleOpenImage: (link: string) => void,
    handleMoveUp: (index: number) => void,
    handleMoveDown: (index: number) => void,
    handleRemove: (index: number) => void,
}
const Product = ({ index, item, handleOpenImage, handleMoveUp, handleMoveDown, handleRemove }: ProductProps) => {
    const [isLinksExpanded, setIsLinksExpanded] = useState<boolean>(false);

    const alphaLink = item?.links?.find((link: any) => link?.linkType === 'ALPHA');
    const productPrice = parseFloat(alphaLink?.price || item?.price || 0).toFixed(2);
    const productDiscountPrice = parseFloat(alphaLink?.discountPrice || item?.dealPrice || 0).toFixed(2);
    const productDiscountPercentage = parseFloat(productDiscountPrice) < parseFloat(productPrice)
        ? ((alphaLink?.discountPrice || item?.dealPrice) ? ((parseFloat(productDiscountPrice) - parseFloat(productPrice)) / parseFloat(productPrice)) * 100 : 0).toFixed(0)
        : '100';

    return (
        <>
            <Table>
                <Tbody>
                    <Tr>
                        <Td width='30px' textAlign='left'>
                            <IconCornerDownRight size={20} />
                        </Td>
                        <Td>
                            {
                                item?.pictureURL
                                    ? <Box
                                        position='relative'
                                        textAlign='center'
                                        width={28}
                                    >
                                        <Image
                                            src={item?.pictureURL}
                                            width={28}
                                            height='auto'
                                            objectFit='cover'
                                            alt={item?.name}
                                            rounded='md'
                                            cursor='pointer'
                                            loading="lazy"
                                            onClick={() => handleOpenImage(item?.pictureURL)}
                                            onError={(e: any) => {
                                                e.target.src = '/images/cover-placeholder.webp';
                                                e.target.onerror = null;
                                            }}
                                        />

                                        {
                                            parseInt(productDiscountPercentage) !== 0
                                                ? <Tag
                                                    position='absolute'
                                                    top='0'
                                                    right='0'
                                                    bgColor='black'
                                                    color='white'
                                                    rounded='md'
                                                    size='sm'
                                                >{productDiscountPercentage}%</Tag>
                                                : null
                                        }
                                    </Box>
                                    : <>
                                        <Text>{item?.name || '-'}</Text>
                                        {
                                            parseInt(productDiscountPercentage) !== 0
                                                ? <Tag
                                                    bgColor='black'
                                                    color='white'
                                                    rounded='md'
                                                    size='sm'
                                                >{productDiscountPercentage}%</Tag>
                                                : null
                                        }
                                    </>
                            }
                        </Td>
                        <Td width={40}>{item?.brand?.name || '-'}</Td>
                        <Td>{item?.name || '-'}</Td>
                        <Td>{item?.style || '-'}</Td>
                        <Td textAlign='center'>
                            <IconButton
                                aria-label='View Links'
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                icon={<IconLink size={22} />}
                                onClick={() => setIsLinksExpanded(!isLinksExpanded)}
                            />
                        </Td>
                        <Td textAlign='center'>
                            <Text whiteSpace='nowrap'>Price: <strong>${productPrice}</strong></Text>
                            { parseFloat(productDiscountPrice) > 0 ? <Text whiteSpace='nowrap'>Deal Price: <strong>${productDiscountPrice}</strong></Text> : null }
                        </Td>
                        <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                        <Td textAlign='right' whiteSpace='nowrap'>
                            <IconButton
                                aria-label='Move Up'
                                variant='ghost'
                                colorScheme='blue'
                                rounded='full'
                                size='sm'
                                icon={<IconArrowUp size={22} />}
                                onClick={() => handleMoveUp(index)}
                            />

                            <IconButton
                                aria-label='Move Down'
                                variant='ghost'
                                colorScheme='blue'
                                rounded='full'
                                size='sm'
                                ml={4}
                                icon={<IconArrowDown size={22} />}
                                onClick={() => handleMoveDown(index)}
                            />

                            <IconButton
                                aria-label='Delete'
                                variant='ghost'
                                colorScheme='red'
                                rounded='full'
                                size='sm'
                                ml={4}
                                icon={<IconTrash size={22} />}
                                onClick={() => handleRemove(index)}
                            />
                        </Td>
                    </Tr>
                </Tbody>
            </Table>

            {/* Product Links */}
            <Box
                bgColor='gray.100'
                display={isLinksExpanded ? 'block' : 'none'}
                p={6}
                width='full'
            >
                <ProductLinks
                    links={item?.links ?? [item?.link] ?? []}
                    productId={item?.id}
                    onSave={() => {
                        setIsLinksExpanded(false);
                    }}
                />
            </Box>
        </>
    )
}

export default LookProducts;