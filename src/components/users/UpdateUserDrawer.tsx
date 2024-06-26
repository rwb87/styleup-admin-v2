import { Avatar, Box, FormControl, FormLabel, Grid, IconButton, Image, Input, Select } from "@chakra-ui/react";
import { IconCamera } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";

type UpdateUserDrawerProps = {
    user: any;
    onComplete: (user: any, isNew: boolean) => void;
    onClose: () => void;
}
const UpdateUserDrawer = ({ user, onComplete, onClose }: UpdateUserDrawerProps) => {
    const [editingUser, setEditingUser] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const coverPhotoRef = useRef<any>(null);
    const profilePhotoRef = useRef<any>(null);
    const creatorBannerRef = useRef<any>(null);

    useEffect(() => {
        setEditingUser(user);
    }, [user]);

    const handleUpdateUser = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        // Common Fields
        payload.append('name', editingUser?.name);
        payload.append('lastName', editingUser?.lastName);
        payload.append('email', editingUser?.email?.toLowerCase());
        payload.append('username', editingUser?.username);
        payload.append('type', editingUser?.type);
        payload.append('gender', editingUser?.gender);

        // Photos
        if (coverPhotoRef.current.files[0]) payload.append('cover', coverPhotoRef.current.files[0]);
        if (profilePhotoRef.current.files[0]) payload.append('picture', profilePhotoRef.current.files[0]);
        // if (user?.type === 'creator' && creatorBannerRef.current.files[0]) payload.append('creatorBanner', creatorBannerRef.current.files[0]);

        if (editingUser?.password) payload.append('password', editingUser?.password);

        // Update user
        try {
            const response = await fetch({
                endpoint: editingUser?.isNew ? '/users' : `/users/${editingUser.id}`,
                method: editingUser?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            notify(response?.message ?? 'User updated successfully', 3000);
            onComplete(response, editingUser?.isNew);
            setEditingUser({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    return (
        <CustomDrawer
            isOpen={!!editingUser?.id}
            title={user?.isNew ? `Create User` : 'Update User'}
            isProcessing={isProcessing}
            onSubmit={handleUpdateUser}
            onClose={() => {
                setEditingUser({})
                onClose();
            }}
        >
            <form action="" style={{ display: 'contents' }}>

                {/* Photos */}
                <Box position='relative'>

                    {/* Cover Photo */}
                    <Image
                        src={editingUser?.coverURL}
                        alt={editingUser?.name}
                        width='full'
                        loading="lazy"
                        aspectRatio={21 / 9}
                        rounded='lg'
                        objectFit='cover'
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
                        onClick={() => coverPhotoRef.current.click()}
                    />

                    {/* Profile Picture */}
                    <Box
                        position='absolute'
                        bottom='-16'
                        left='50%'
                        transform='translateX(-50%)'
                    >
                        <Avatar
                            size='2xl'
                            name={editingUser?.name}
                            src={editingUser?.pictureURL}
                            border='4px solid white'
                        />

                        {/* Edit Profile Picture */}
                        <IconButton
                            position='absolute'
                            bottom='0'
                            right='0'
                            rounded='full'
                            colorScheme='gray'
                            aria-label='Edit profile photo'
                            icon={<IconCamera size={22} />}
                            onClick={() => profilePhotoRef.current.click()}
                        />
                    </Box>
                </Box>

                {/* Name */}
                <Grid
                    mt={20}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="firstName">
                        <FormLabel>First Name</FormLabel>
                        <Input
                            type="text"
                            required
                            autoComplete="firstName"
                            value={editingUser?.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="lastName">
                        <FormLabel>Last Name</FormLabel>
                        <Input
                            type="text"
                            required
                            autoComplete="lastName"
                            value={editingUser?.lastName}
                            onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                        />
                    </FormControl>
                </Grid>

                {/* Email and Username */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="email">
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            required
                            autoComplete="email"
                            value={editingUser?.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="username">
                        <FormLabel>Username</FormLabel>
                        <Input
                            type="text"
                            required
                            autoComplete="username"
                            value={editingUser?.username}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        />
                    </FormControl>
                </Grid>

                {/* Role and Gender */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="role">
                        <FormLabel>Role</FormLabel>
                        <Select
                            placeholder='Select role'
                            value={editingUser?.type}
                            onChange={(e) => setEditingUser({ ...editingUser, type: e.target.value })}
                        >
                            <option value="admin">Admin</option>
                            <option value="shopper">Shopper</option>
                            <option value="creator">Creator</option>
                        </Select>
                    </FormControl>

                    <FormControl id="gender">
                        <FormLabel>Gender</FormLabel>
                        <Select
                            placeholder='Select Gender'
                            value={editingUser?.gender}
                            onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Password */}
                <FormControl mt={4} id="password">
                    <FormLabel>Password (Leave blank to keep current password)</FormLabel>
                    <Input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={editingUser?.password}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    />
                </FormControl>

                {/* Creator Banner */}
                {
                    editingUser?.type === 'creator' && <FormControl mt={4} id="creatorBanner" display='none'>
                        <FormLabel>Creator Banner</FormLabel>

                        <Box position='relative'>
                            <Image
                                src={editingUser?.creatorBannerURL}
                                alt={editingUser?.name}
                                width='full'
                                loading="lazy"
                                aspectRatio={21 / 9}
                                rounded='lg'
                                objectFit='contain'
                                bgColor='gray.100'
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
                                onClick={() => creatorBannerRef.current.click()}
                            />
                        </Box>
                    </FormControl>
                }

                {/* Cover photo input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={coverPhotoRef}
                    hidden
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingUser({ ...editingUser, coverURL: URL.createObjectURL(photo) });
                    }}
                />

                {/* Profile photo input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={profilePhotoRef}
                    hidden
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingUser({ ...editingUser, pictureURL: URL.createObjectURL(photo) });
                    }}
                />

                {/* Creator Banner input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={creatorBannerRef}
                    hidden
                    disabled={editingUser?.type !== 'creator'}
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingUser({ ...editingUser, creatorBannerURL: URL.createObjectURL(photo) });
                    }}
                />
            </form>
        </CustomDrawer>
    )
}

export default UpdateUserDrawer;