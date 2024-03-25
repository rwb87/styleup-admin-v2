import CustomDrawer from "@/components/Drawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import AppLayout from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, FormControl, FormLabel, Grid, IconButton, Image, Input, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconCamera, IconChevronLeft, IconChevronRight, IconEdit, IconLoader2, IconPlus, IconTrash, IconUnlink, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const BrandsView = () => {
    const cancelDeleteRef = useRef<any>(null);
    const brandImageRef = useRef<any>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useAuthGuard('auth');

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        setFilteredData(
            data?.filter((item: any) => {
                return item?.name.toLowerCase().includes(search.toLowerCase());
            })
        );
    }, [search, data]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/brands`,
                method: 'GET',
            });

            // Sort by createdAt
            response.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setData(response);
        } catch (error: any) {
            const { message } = error.response.data ?? { message: 'An error occurred' };
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    const handleUpdateData = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('pageLink', editingData?.pageLink);

        if (brandImageRef?.current.files[0]) payload.append('picture', brandImageRef?.current.files[0]);

        try {
            const response = await fetch({
                endpoint: `/brands${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Brand saved successfully', 3000);
                setEditingData({});
                getData();
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const { message } = error.response.data ?? { message: 'An error occurred' };
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/brands/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('User deleted successfully', 3000);
            else notify('An error occurred', 3000);

            setData(data.filter((user: any) => user.id !== deletingData.id));
            setDeletingData({});
        } catch (error: any) {
            const { message } = error.response.data ?? { message: 'An error occurred' };
            notify(message, 3000);
            setIsDeleting(false);
        }
    }

    return (
        <AppLayout activePage="Brands">

            {/* Search and Options */}
            <Flex
                justifyContent='space-between'
                alignItems='center'
                mb={4}
            >
                {/* Page Heading */}
                <h1 className="page-heading">Brands</h1>

                {/* Search and Actions */}
                <Flex gap={2} alignItems='center'>
                    <Input
                        type='search'
                        placeholder='Search'
                        size='sm'
                        variant='outline'
                        width='300px'
                        rounded='md'
                        bgColor='white'
                        borderColor='gray.100'

                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <Tooltip label='Add new brand'>
                        <IconButton
                            aria-label="Add new user"
                            variant='solid'
                            size='sm'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
                            icon={<IconPlus size={20} />}
                            onClick={() => setEditingData({
                                id: Math.random().toString(36).substring(7),
                                name: '',
                                pageLink: '',
                                pictureURL: '',
                                isNew: true,
                            })}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Table */}
            <BrandsTable
                data={filteredData}
                isLoading={isLoading}
                onEdit={(data: any) => setEditingData(data)}
                onDelete={(id: string) => setDeletingData(id)}
            />

            {/* Update Brand */}
            <CustomDrawer
                isOpen={!!editingData?.id}
                title={editingData?.isNew ? `Create Brand` : 'Update Brand'}
                isProcessing={isProcessing}
                onSubmit={handleUpdateData}
                onClose={() => {
                    setEditingData({})
                }}
            >
                <Grid
                    mt={4}
                    templateColumns='1fr'
                    gap={4}
                >
                    <FormControl id="name">
                        <FormLabel>Brand Name</FormLabel>
                        <Input
                            type="text"
                            required
                            autoComplete="off"
                            value={editingData?.name}
                            onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="pageLink">
                        <FormLabel>Brand Website</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            value={editingData?.pageLink}
                            onChange={(e) => setEditingData({ ...editingData, pageLink: e.target?.value?.toLowerCase() })}
                        />
                    </FormControl>

                    <FormControl mt={4} id="creatorBanner">
                        <FormLabel>Brand Logo (Leave blank to keep current image)</FormLabel>

                        <Box position='relative'>
                            <Image
                                src={editingData?.pictureURL}
                                alt={editingData?.name}
                                width='full'
                                loading="lazy"
                                aspectRatio={21 / 9}
                                rounded='lg'
                                objectFit='contain'
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />

                            {/* Edit Cover Button */}
                            <IconButton
                                position='absolute'
                                top='2'
                                right='2'
                                rounded='full'
                                colorScheme='gray'
                                aria-label='Edit cover photo'
                                icon={<IconCamera size={22} />}
                                onClick={() => brandImageRef.current.click()}
                            />
                        </Box>
                    </FormControl>

                    {/* Brand Logo input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={brandImageRef}
                        hidden
                        onChange={(e: any) => {
                            const photo = e.target.files[0];

                            if(!photo) return;

                            setEditingData({ ...editingData, pictureURL: URL.createObjectURL(photo) });
                        }}
                    />
                </Grid>
            </CustomDrawer>

            {/* Delete Dialog */}
            <AlertDialog
                leastDestructiveRef={cancelDeleteRef}
                onClose={() => setDeletingData({})}
                isOpen={!!deletingData?.id}
                isCentered
                closeOnOverlayClick={!isDeleting}
                closeOnEsc={!isDeleting}
            >
                <AlertDialogOverlay />

                <AlertDialogContent>

                    <AlertDialogHeader>Confirmation</AlertDialogHeader>

                    <AlertDialogCloseButton isDisabled={isDeleting}/>
                    <AlertDialogBody>Are you sure you want to delete <strong>{deletingData?.name}</strong>? You can't undo this action afterwards.</AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            ref={cancelDeleteRef}
                            variant='ghost'
                            size='sm'
                            isDisabled={isDeleting}
                            onClick={() => setDeletingData({})}
                        >Nevermind</Button>
                        <Button
                            colorScheme='red'
                            size='sm'
                            ml={4}
                            isLoading={isDeleting}
                            loadingText='Deleting...'
                            onClick={handleDelete}
                        >Yes, Delete</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    )
}

type BrandsTableProps = {
    data: any,
    isLoading: boolean,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
const BrandsTable = ({ data, isLoading, onEdit, onDelete }: BrandsTableProps) => {
    const limit = 15;
    const totalPages = Math.ceil(data.length / limit);
    const [page, setPage] = useState<number>(1);

    const reconstructedData = data?.length > limit ? data.slice((page - 1) * limit, page * limit) : data;

    useEffect(() => {
        setPage(1);
    }, [totalPages]);

    return (
        <>

            {/* Table */}
            <Box className="table-responsive">
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Image</Th>
                            <Th textAlign='center'>Website</Th>
                            <Th textAlign='center'># of Items</Th>
                            <Th textAlign='center'>Partnership</Th>
                            <Th textAlign='center' color='green.500'>Clickouts</Th>
                            <Th textAlign='center'>Actions</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {
                            isLoading
                                ? <Tr>
                                    <Td colSpan={20} textAlign='center'>
                                        <Box display='inline-block' mx='auto'>
                                            <IconLoader2
                                                size={48}
                                                className="animate-spin"
                                            />
                                        </Box>
                                    </Td>
                                </Tr>
                                : !reconstructedData?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : reconstructedData.map((item: any) => (
                                        <Tr key={item?.id}>
                                            <Td>{item?.name || '-'}</Td>
                                            <Td>
                                                {
                                                    item?.pictureURL
                                                        ? <Image
                                                            src={item?.pictureURL}
                                                            width={28}
                                                            height='auto'
                                                            objectFit='contain'
                                                            alt={item?.name}
                                                        />
                                                        : <IconUnlink size={26} />
                                                }
                                            </Td>
                                            <Td textAlign='center'>
                                                {
                                                    item?.pageLink
                                                        ? <a
                                                            href={['http', 'https'].includes(item?.pageLink?.substr(0, 4))? item?.pageLink : `http://${item?.pageLink}`}
                                                            target='_blank'
                                                            style={{ display: 'inline-grid', placeSelf: 'center' }}
                                                        ><IconWorldWww size={26} strokeWidth={1.2} /></a>
                                                        : '-'
                                                }
                                            </Td>
                                            <Td textAlign='center'>{item?.items?.length || 0}</Td>
                                            <Td textAlign='center'>{item?.partnership || '-'}</Td>
                                            <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                                            <Td textAlign='center'>
                                                <IconButton
                                                    aria-label="Edit"
                                                    variant='ghost'
                                                    rounded='full'
                                                    size='sm'
                                                    icon={<IconEdit size={22} />}
                                                    onClick={() => onEdit?.(item)}
                                                />

                                                <IconButton
                                                    aria-label='Delete'
                                                    variant='ghost'
                                                    colorScheme='red'
                                                    rounded='full'
                                                    size='sm'
                                                    ml={4}
                                                    icon={<IconTrash size={22} />}
                                                    onClick={() => onDelete?.(item)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Pagination */}
            <Flex
                justifyContent='center'
                alignItems='center'
                mt={4}
                mb={4}
            >
                {
                    data.length > limit && (
                        <Box>
                            <IconButton
                                aria-label='Previous'
                                variant='ghost'
                                colorScheme='gray'
                                rounded='full'
                                size='sm'
                                icon={<IconChevronLeft size={22} />}
                                onClick={() => setPage(page - 1)}
                                isDisabled={page === 1}
                            />

                            {Array.from({ length: Math.ceil(data.length / limit) }, (_, index) => (
                                <IconButton
                                    key={index}
                                    aria-label={`Page ${index + 1}`}
                                    variant='ghost'
                                    colorScheme='gray'
                                    rounded='full'
                                    size='sm'
                                    ml={2}
                                    isActive={page === index + 1}
                                    icon={<Text fontWeight='bold'>{index + 1}</Text>}
                                    onClick={() => setPage(index + 1)}
                                />
                            ))}

                            <IconButton
                                aria-label='Next'
                                variant='ghost'
                                colorScheme='gray'
                                rounded='full'
                                size='sm'
                                icon={<IconChevronRight size={22} />}
                                onClick={() => setPage(page + 1)}
                                isDisabled={page === Math.ceil(data.length / limit)}
                            />
                        </Box>
                    )
                }
            </Flex>
        </>
    )
}

export default BrandsView;